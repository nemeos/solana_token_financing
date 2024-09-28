use anchor_lang::prelude::*;

use anchor_spl::token::{Mint, Token};

use crate::errors::ErrorCode;
use crate::states::{loan_account::LoanAccount, vault_account::VaultAccount};

pub fn create_loan(
    ctx: Context<CreateLoan>,
    payment_amount: u64,
    nb_of_tokens_per_payment: u64,
    nb_payments: u8,
    period_duration: u64,
) -> Result<()> {
    // Check that there is enough tokens in the token vault for this loan
    let vault_account = &mut ctx.accounts.vault_account;
    vault_account.available_tokens = vault_account
        .available_tokens
        .checked_sub((nb_payments as u64) * nb_of_tokens_per_payment)
        .ok_or(ErrorCode::Overflow)?;

    // Transfer fees (SOL) from borrower to Nemeos
    let mut fees_amount =
        ((nb_payments * vault_account.interest_rate) as u64) * payment_amount / 100;
    // TODO maybe could be removed
    if fees_amount == 0 {
        fees_amount = 1;
    }

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

    // Create loan account
    let loan_account = &mut ctx.accounts.loan_account;
    loan_account.borrower = ctx.accounts.borrower.key();
    loan_account.payment_amount = payment_amount;
    loan_account.nb_of_tokens_per_payment = nb_of_tokens_per_payment;
    loan_account.nb_remaining_payments = nb_payments;
    loan_account.period_duration = period_duration;
    let now = Clock::get()?.unix_timestamp as u64;
    // TODO the first deadline could be shorter
    loan_account.next_payment_deadline = now + period_duration;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateLoan<'info> {
    #[account(
            init,
            payer = borrower,
            seeds=[b"nemeos_loan_account", mint.key().as_ref(),borrower.key().as_ref(), seller.key().as_ref()],
            space= 8 + LoanAccount::INIT_SPACE,
            bump
    )]
    loan_account: Account<'info, LoanAccount>,

    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(mut)]
    pub borrower: Signer<'info>,
    #[account(mut)]
    pub nemeos: SystemAccount<'info>,

    #[account(mut)]
    pub vault_account: Account<'info, VaultAccount>,

    pub mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
