use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::states::{
    loan_account::LoanAccount,
    vault_account::{TokenAccountOwnerPda, VaultAccount},
};

pub fn full_early_repayment(ctx: Context<FullEarlyRepayment>) -> Result<()> {
    let loan_account = &mut ctx.accounts.loan_account;

    let now = Clock::get()?.unix_timestamp as u64;
    if loan_account.end_period < now {
        // TODO close the loan
        return Err(ErrorCode::TooLate.into());
    }
    if loan_account.nb_remaining_payments == 0 {
        return Err(ErrorCode::NoRemainingPayments.into());
    }

    // Transfer SOL fees from borrower to Nemeos
    // Fees are set at 3% of the remaining principal
    let fees_amount =
        (loan_account.nb_remaining_payments as u64) * loan_account.payment_amount * 3 / 100;
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.borrower.key(),
        &ctx.accounts.nemeos.key(),
        fees_amount,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.borrower.to_account_info(),
            ctx.accounts.nemeos.to_account_info(),
        ],
    )?;

    // Transfer SOL from borrower to seller
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.borrower.key(),
        &ctx.accounts.seller.key(),
        loan_account.payment_amount * loan_account.nb_remaining_payments as u64,
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
    token::transfer(
        cpi_ctx,
        loan_account.nb_of_tokens_per_payment * loan_account.nb_remaining_payments as u64,
    )?;

    // Update loan account
    loan_account.start_period = now;
    loan_account.end_period = now;
    loan_account.nb_remaining_payments = 0;

    // TODO close the loan

    Ok(())
}

#[derive(Accounts)]
pub struct FullEarlyRepayment<'info> {
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
    seller: SystemAccount<'info>,
    #[account(mut)]
    borrower: Signer<'info>,
    #[account(mut)]
    nemeos: SystemAccount<'info>,

    #[account(
            mut,
            seeds=[b"nemeos_vault_token_account", mint.key().as_ref()],
            bump
    )]
    vault_token_account: Account<'info, TokenAccount>,
    #[account(
            mut,
            seeds=[b"nemeos_vault_account", mint.key().as_ref()],
            bump,
            has_one = seller,
            has_one = nemeos,
    )]
    vault_account: Account<'info, VaultAccount>,

    mint: Account<'info, Mint>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}
