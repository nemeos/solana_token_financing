use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::states::{loan_account::LoanAccount, vault_account::VaultAccount};

const SECONDS_PER_YEAR: u64 = 60 * 60 * 24 * 365;

pub fn create_loan(
    ctx: Context<CreateLoan>,
    payment_amount: u64,
    nb_of_tokens_per_payment: u64,
    nb_payments: u8,
    period_duration_in_seconds: u64,
) -> Result<()> {
    // Check that there is enough tokens in the token vault for this loan
    let vault_account = &mut ctx.accounts.vault_account;
    vault_account.available_tokens = vault_account
        .available_tokens
        .checked_sub((nb_payments as u64) * nb_of_tokens_per_payment)
        .ok_or(ErrorCode::Overflow)?;

    // Transfer fees from borrower to Nemeos
    // fees_amount = (annual_interest_rate * loan_duration_in_seconds / seconds_per_year)
    //               * loan_amount / 2
    let loan_amount = (nb_payments as u64) * payment_amount;
    let loan_duration_in_seconds = (nb_payments as u64) * period_duration_in_seconds;
    let fees_amount =
        (vault_account.annual_interest_rate as u64) * loan_duration_in_seconds * loan_amount
            / (100 * SECONDS_PER_YEAR * 2);

    if ctx.accounts.nemeos_payment_account.mint != vault_account.payment_currency {
        return Err(ErrorCode::WrongCurrency.into());
    }
    if ctx.accounts.nemeos_payment_account.owner != vault_account.nemeos {
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

    // Create loan account
    let loan_account = &mut ctx.accounts.loan_account;
    loan_account.borrower = ctx.accounts.borrower.key();
    loan_account.seller = ctx.accounts.seller.key();
    loan_account.nemeos = vault_account.nemeos;
    loan_account.payment_currency = vault_account.payment_currency;
    loan_account.payment_amount = payment_amount;
    loan_account.nb_of_tokens_per_payment = nb_of_tokens_per_payment;
    loan_account.nb_remaining_payments = nb_payments;
    loan_account.period_duration_in_seconds = period_duration_in_seconds;
    let now = Clock::get()?.unix_timestamp as u64;
    loan_account.start_period = now;
    // TODO the first deadline could be shorter
    loan_account.end_period = now + period_duration_in_seconds;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateLoan<'info> {
    // TODO if the same borrower would like to create a loan for the same token, he should create a new account
    #[account(
            init,
            payer = borrower,
            seeds=[b"nemeos_loan_account", mint.key().as_ref(),borrower.key().as_ref()],
            space= 8 + LoanAccount::INIT_SPACE,
            bump
    )]
    loan_account: Account<'info, LoanAccount>,

    #[account(mut)]
    seller: Signer<'info>,
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
            has_one = seller,
    )]
    vault_account: Account<'info, VaultAccount>,

    mint: Account<'info, Mint>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}
