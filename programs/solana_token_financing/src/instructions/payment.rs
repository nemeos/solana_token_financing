use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::constants::USDC_PUBKEY;
use crate::errors::ErrorCode;
use crate::states::{loan_account::LoanAccount, vault_account::TokenAccountOwnerPda};

pub fn payment(ctx: Context<Payment>) -> Result<()> {
    let loan_account = &mut ctx.accounts.loan_account;

    // Check that it is the right time to repay the loan (and that the loan is not finished)
    let now = Clock::get()?.unix_timestamp as u64;
    if loan_account.end_period < now {
        // TODO close the loan
        return Err(ErrorCode::TooLate.into());
    }
    if loan_account.start_period > now {
        return Err(ErrorCode::TooEarly.into());
    }
    if loan_account.nb_remaining_payments == 0 {
        return Err(ErrorCode::NoRemainingPayments.into());
    }

    // Transfer from borrower to seller
    if ctx.accounts.seller_payment_account.mint != USDC_PUBKEY {
        return Err(ErrorCode::WrongCurrency.into());
    }
    if ctx.accounts.seller_payment_account.owner != loan_account.seller {
        return Err(ErrorCode::WrongReceiver.into());
    }
    let cpi_payment_accounts = Transfer {
        from: ctx.accounts.borrower_payment_account.to_account_info(),
        to: ctx.accounts.seller_payment_account.to_account_info(),
        authority: ctx.accounts.borrower.to_account_info(),
    };
    let cpi_payment_program = ctx.accounts.token_program.to_account_info();
    let cpi_payment_context = CpiContext::new(cpi_payment_program, cpi_payment_accounts);
    token::transfer(cpi_payment_context, loan_account.payment_amount)?;

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

    // Update loan account
    loan_account.start_period = loan_account.end_period;
    loan_account.end_period += loan_account.period_duration_in_seconds;
    loan_account.nb_remaining_payments -= 1;

    // TODO close loan account when no remaining payments

    Ok(())
}

#[derive(Accounts)]
pub struct Payment<'info> {
    #[account(
            mut,
            seeds=[b"nemeos_loan_account", mint.key().as_ref(), borrower.key().as_ref()],
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
    borrower: Signer<'info>,
    #[account(mut)]
    seller_payment_account: Account<'info, TokenAccount>,
    #[account(mut)]
    borrower_payment_account: Account<'info, TokenAccount>,

    #[account(
            mut,
            seeds=[b"nemeos_vault_token_account", mint.key().as_ref()],
            bump
    )]
    vault_token_account: Account<'info, TokenAccount>,

    mint: Account<'info, Mint>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}
