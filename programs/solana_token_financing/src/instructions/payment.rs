use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::states::{
    loan_account::LoanAccount,
    vault_account::{TokenAccountOwnerPda, VaultAccount},
};

pub fn payment(ctx: Context<Payment>) -> Result<()> {
    let loan_account = &mut ctx.accounts.loan_account;

    // Checks
    let now = Clock::get()?.unix_timestamp as u64;
    if loan_account.next_payment_deadline < now {
        // TODO close the loan
        return Err(ErrorCode::TooLate.into());
    }
    if loan_account.nb_remaining_payments == 0 {
        return Err(ErrorCode::NoRemainingPayments.into());
    }

    // Transfer SOL from borrower to seller
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.borrower.key(),
        &ctx.accounts.seller.key(),
        loan_account.payment_amount,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.borrower.to_account_info(),
            ctx.accounts.seller.to_account_info(),
        ],
    )?;

    // Transfer tokens from token vault to borrower
    let transfer_instruction = Transfer {
        from: ctx.accounts.vault_token_account.to_account_info(),
        to: ctx.accounts.borrower_token_account.to_account_info(),
        authority: ctx.accounts.token_account_owner_pda.to_account_info(),
    };
    let bump = ctx.bumps.token_account_owner_pda;
    let seeds = &[b"token_account_owner_pda".as_ref(), &[bump]];
    let signer = &[&seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
        signer,
    );
    token::transfer(cpi_ctx, loan_account.nb_of_tokens_per_payment)?;

    loan_account.next_payment_deadline += loan_account.period_duration;
    loan_account.nb_remaining_payments -= 1;

    // TODO: close loan if nb_remaining_payments == 0

    Ok(())
}

#[derive(Accounts)]
pub struct Payment<'info> {
    #[account(
            mut,
            seeds=[b"nemeos_loan_account", mint.key().as_ref(), borrower.key().as_ref(), seller.key().as_ref()],
            bump
    )]
    loan_account: Account<'info, LoanAccount>,

    #[account(
        seeds=[b"token_account_owner_pda"],
        bump
    )]
    token_account_owner_pda: Account<'info, TokenAccountOwnerPda>,

    #[account(
            init_if_needed,
            payer = borrower,
            seeds=[b"nemeos_borrower_token_account", mint.key().as_ref(), borrower.key().as_ref()],
            token::mint=mint,
            token::authority=borrower,
            bump
    )]
    borrower_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller: SystemAccount<'info>,
    #[account(mut)]
    pub borrower: Signer<'info>,

    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut, has_one = vault_token_account)]
    pub vault_account: Account<'info, VaultAccount>,

    pub mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
