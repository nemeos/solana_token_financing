use anchor_lang::prelude::*;

#[account]
pub struct TokenAccountOwnerPda {}

#[account]
#[derive(InitSpace)]
pub struct VaultAccount {
    pub nemeos: Pubkey,
    pub seller: Pubkey,
    pub available_tokens: u64,
    pub annual_interest_rate: u8,
}
