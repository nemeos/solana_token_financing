use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::constants::{LOANS, LOTS, NEMEOS_PUBKEY, USDC_PUBKEY};
use crate::errors::ErrorCode;
use crate::states::{loan_account::LoanAccount, vault_account::VaultAccount};

const SECONDS_PER_YEAR: u64 = 60 * 60 * 24 * 365;

pub fn create_loan(
    ctx: Context<CreateLoan>,
    lot_quantity: u8,
    lot_id: u8,
    loan_id: u8,
) -> Result<()> {
    // Check that the lot and the loan exist
    let lot = LOTS.get(lot_id as usize).ok_or(ErrorCode::LotNotFound)?;
    let loan = LOANS.get(loan_id as usize).ok_or(ErrorCode::LoanNotFound)?;

    let loan_amount = (lot_quantity as u64) * lot.token_quantity * lot.token_price;
    let upfront_amount = loan_amount * (loan.upfront as u64) / 100;
    let payment_amount = (loan_amount - upfront_amount) / (loan.nb_of_payments as u64 - 1);
    let total_token_quantity =
        lot.token_quantity * 10u64.pow(ctx.accounts.mint.decimals as u32) * (lot_quantity as u64);
    let upfront_token_quantity = total_token_quantity * (loan.upfront as u64) / 100;
    let token_quantity_per_payment =
        (total_token_quantity - upfront_token_quantity) / (loan.nb_of_payments as u64 - 1);

    // Check that there is enough tokens in the token vault for this loan
    let vault_account = &mut ctx.accounts.vault_account;
    vault_account.available_tokens = vault_account
        .available_tokens
        .checked_sub(total_token_quantity)
        .ok_or(ErrorCode::Overflow)?;

    // Transfer fees from borrower to Nemeos
    // fees_amount = (annual_interest_rate * loan_duration_in_seconds / seconds_per_year)
    //               * loan_amount / 2
    let loan_duration_in_seconds =
        loan.period_duration_in_seconds * (loan.nb_of_payments as u64 - 1);
    let fees_amount = (loan.annual_interest_rate as u64) * loan_duration_in_seconds * loan_amount
        / (100 * SECONDS_PER_YEAR * 2);
    if ctx.accounts.nemeos_payment_account.mint != USDC_PUBKEY {
        return Err(ErrorCode::WrongCurrency.into());
    }
    if ctx.accounts.nemeos_payment_account.owner != NEMEOS_PUBKEY {
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

    // TODO up_front payment (and transfer of corresponding tokens)

    // Create loan account
    let loan_account = &mut ctx.accounts.loan_account;
    loan_account.borrower = ctx.accounts.borrower.key();
    loan_account.seller = ctx.accounts.vault_account.seller;
    loan_account.lot_id = lot_id;
    loan_account.loan_id = loan_id;
    loan_account.payment_amount = payment_amount;
    loan_account.nb_of_tokens_per_payment = token_quantity_per_payment;
    loan_account.nb_remaining_payments = loan.nb_of_payments;
    loan_account.period_duration_in_seconds = loan.period_duration_in_seconds;
    let now = Clock::get()?.unix_timestamp as u64;
    loan_account.start_period = now;
    // 10 minutes (600s) to pay the upfront payment
    loan_account.end_period = now + 600;
    loan_account.upfront_amount = upfront_amount;
    loan_account.upfront_token_quantity = upfront_token_quantity;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateLoan<'info> {
    #[account(
            init,
            payer = borrower,
            seeds=[b"nemeos_loan_account", mint.key().as_ref(),borrower.key().as_ref()],
            space= 8 + LoanAccount::INIT_SPACE,
            bump
    )]
    loan_account: Account<'info, LoanAccount>,

    #[account(mut)]
    borrower: Signer<'info>,
    #[account(mut)]
    nemeos_payment_account: Account<'info, TokenAccount>,
    #[account(mut)]
    borrower_payment_account: Account<'info, TokenAccount>,

    #[account(
            mut,
            seeds=[b"nemeos_vault_account", mint.key().as_ref()],
            bump,
    )]
    vault_account: Account<'info, VaultAccount>,

    mint: Account<'info, Mint>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}
