use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct LoanAccount {
    pub borrower: Pubkey,
    pub payment_amount: u64,
    pub nb_of_tokens_per_payment: u64,
    pub nb_remaining_payments: u8,
    pub period_duration: u64,
    pub next_payment_deadline: u64,
}
