use anchor_lang::prelude::*;

use anchor_spl::token::{self, Transfer};

use crate::constants::USDC_PUBKEY;
use crate::errors::ErrorCode;
use crate::instructions::Payment;

pub fn upfront_payment(ctx: Context<Payment>) -> Result<()> {
    let loan_account = &mut ctx.accounts.loan_account;

    if loan_account.upfront_amount == 0 {
        return Err(ErrorCode::UpfrontAlreadyPayed.into());
    }

    // Check that it is the right time to repay the loan (and that the loan is not finished)
    let now = Clock::get()?.unix_timestamp as u64;
    if loan_account.end_period < now {
        // TODO close the loan
        return Err(ErrorCode::TooLate.into());
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
    token::transfer(cpi_payment_context, loan_account.upfront_amount)?;

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
    token::transfer(cpi_ctx, loan_account.upfront_token_quantity)?;

    // Update loan account
    loan_account.end_period = loan_account.start_period + loan_account.period_duration_in_seconds;
    loan_account.nb_remaining_payments -= 1;
    loan_account.upfront_amount = 0;

    Ok(())
}
