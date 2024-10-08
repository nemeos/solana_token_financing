use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;

declare_id!("HtqUGmzuqaRD4naSAG9qH4T23B8454ZeyZp33UF9wSrU");

#[program]
pub mod solana_token_financing {
    use super::*;

    pub fn initialize_token_account_owner_pda(
        ctx: Context<InitializeTokenAccountOwnerPda>,
    ) -> Result<()> {
        instructions::initialize_token_account_owner_pda(ctx)
    }

    pub fn initialize_token_vault(ctx: Context<InitializeTokenAccount>) -> Result<()> {
        instructions::initialize_token_vault(ctx)
    }

    pub fn token_deposit(ctx: Context<TokenDeposit>, amount: u64) -> Result<()> {
        instructions::token_deposit(ctx, amount)
    }

    pub fn token_withdraw(ctx: Context<TokenWithdraw>, amount: u64) -> Result<()> {
        instructions::token_withdraw(ctx, amount)
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
