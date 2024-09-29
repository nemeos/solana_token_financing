use anchor_lang::prelude::*;

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
        payment_amount: u64,
        nb_of_tokens_per_payment: u64,
        nb_payments: u8,
        period_duration_in_seconds: u64,
    ) -> Result<()> {
        instructions::create_loan(
            ctx,
            payment_amount,
            nb_of_tokens_per_payment,
            nb_payments,
            period_duration_in_seconds,
        )
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
}
