use anchor_lang::prelude::*;

use anchor_spl::token::Mint;

use crate::errors::ErrorCode;
use crate::states::loan_account::LoanAccount;
use crate::states::vault_account::VaultAccount;

pub fn close_loan(ctx: Context<CloseLoan>) -> Result<()> {
    let loan_account = &ctx.accounts.loan_account;

    if loan_account.nb_remaining_payments == 0 {
        // Close loan without updating the number of available tokens in the vault
        return Ok(());
    }

    let now = Clock::get()?.unix_timestamp as u64;
    if loan_account.end_period < now {
        // Update available tokens in the vault
        let vault_account = &mut ctx.accounts.vault_account;
        vault_account.available_tokens = vault_account
            .available_tokens
            .checked_add(
                (loan_account.nb_remaining_payments as u64) * loan_account.nb_of_tokens_per_payment,
            )
            .ok_or(ErrorCode::Overflow)?;
        // Close loan
        return Ok(());
    }

    // Do not close the loan
    Err(ErrorCode::ImpossibleToCloseLoan.into())
}

#[derive(Accounts)]
pub struct CloseLoan<'info> {
    #[account(
            mut,
            close = borrower,
            has_one = borrower,
            seeds=[b"nemeos_loan_account", mint.key().as_ref(), borrower.key().as_ref()],
            bump
    )]
    loan_account: Account<'info, LoanAccount>,

    #[account(
            mut,
            seeds=[b"nemeos_vault_account", mint.key().as_ref()],
            bump,
    )]
    vault_account: Account<'info, VaultAccount>,

    #[account(mut)]
    borrower: SystemAccount<'info>,

    mint: Account<'info, Mint>,

    system_program: Program<'info, System>,
}
