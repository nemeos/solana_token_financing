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
        nemeos: Pubkey,
    ) -> Result<()> {
        instructions::initialize_token_vault(ctx, nemeos)
    }

    pub fn token_deposit(ctx: Context<TokenDeposit>, amount: u64) -> Result<()> {
        instructions::token_deposit(ctx, amount)
    }

    pub fn create_loan(
        ctx: Context<CreateLoan>,
        payment_amount: u64,
        nb_of_tokens_per_payment: u64,
        nb_payments: u8,
        period_duration: u64,
    ) -> Result<()> {
        instructions::create_loan(
            ctx,
            payment_amount,
            nb_of_tokens_per_payment,
            nb_payments,
            period_duration,
        )
    }
}

// #[account]
// #[derive(InitSpace)]
// pub struct Loan {
//     borrower: Pubkey,
//     seller: Pubkey,
//     token_id: Pubkey,
//     period_duration: u64,
//     period_end: u64,
//     nb_of_payments: u8,
//     payment_amount: u32,
//     nb_of_tokens_per_payment: u8,
// }
