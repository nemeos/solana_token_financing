use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct LoanAccount {
    pub borrower: Pubkey, // TODO could be removed (already in the PDA)
    pub seller: Pubkey,   // TODO could be removed (already in the PDA)
    pub lot_quantity: u8,
    pub lot_id: u8,
    pub loan_id: u8,
    pub payment_amount: u64,
    pub nb_of_tokens_per_payment: u64,
    pub nb_remaining_payments: u8,
    pub period_duration_in_seconds: u64,
    pub start_period: u64,
    pub end_period: u64,
    pub upfront_amount: u64,
    pub upfront_token_quantity: u64,
}
