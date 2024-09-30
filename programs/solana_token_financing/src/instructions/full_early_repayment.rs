use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::constants::USDC_PUBKEY;
use crate::errors::ErrorCode;
use crate::states::{loan_account::LoanAccount, vault_account::TokenAccountOwnerPda};

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

    // Transfer fees from borrower to Nemeos
    // Fees are set at 3% of the remaining principal
    let fees_amount =
        (loan_account.nb_remaining_payments as u64) * loan_account.payment_amount * 3 / 100;
    if ctx.accounts.nemeos_payment_account.mint != USDC_PUBKEY {
        return Err(ErrorCode::WrongCurrency.into());
    }
    if ctx.accounts.nemeos_payment_account.owner != loan_account.nemeos {
        return Err(ErrorCode::WrongReceiver.into());
    }
    let cpi_accounts = Transfer {
        from: ctx.accounts.borrower_payment_account.to_account_info(),
        to: ctx.accounts.nemeos_payment_account.to_account_info(),
        authority: ctx.accounts.borrower.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_context, fees_amount)?;

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
    token::transfer(
        cpi_payment_context,
        loan_account.payment_amount * (loan_account.nb_remaining_payments as u64),
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
    #[account(mut)]
    nemeos_payment_account: Account<'info, TokenAccount>,

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
