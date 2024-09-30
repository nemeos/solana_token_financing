use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;

declare_id!("5HfozzNSUjtouPPAUJrqPgC4wnwsqg7akvVstjY11Vec");

#[program]
pub mod solana_token_financing {
    use super::*;

    pub fn initialize_token_vault(
        ctx: Context<InitializeTokenAccount>,
        annual_interest_rate: u8,
    ) -> Result<()> {
        instructions::initialize_token_vault(ctx, annual_interest_rate)
    }

    pub fn token_deposit(ctx: Context<TokenDeposit>, amount: u64) -> Result<()> {
        instructions::token_deposit(ctx, amount)
    }

    pub fn create_loan(
        ctx: Context<CreateLoan>,
        lot_quantity: u8,
        lot_id: u8,
        loan_id: u8,
    ) -> Result<()> {
        instructions::create_loan(ctx, lot_quantity, lot_id, loan_id)
    }

    pub fn upfront_payment(ctx: Context<Payment>) -> Result<()> {
        instructions::upfront_payment(ctx)
    }

    pub fn payment(ctx: Context<Payment>) -> Result<()> {
        instructions::payment(ctx)
    }

    pub fn full_early_repayment(ctx: Context<FullEarlyRepayment>) -> Result<()> {
        instructions::full_early_repayment(ctx)
    }

    pub fn close_loan(ctx: Context<CloseLoan>) -> Result<()> {
        instructions::close_loan(ctx)
    }

    pub fn close_vault_accounts(ctx: Context<CloseVaultAccounts>) -> Result<()> {
        instructions::close_vault_accounts(ctx)
    }
}
