use anchor_lang::prelude::*;

#[account]
pub struct TokenAccountOwnerPda {}

#[account]
#[derive(InitSpace)]
pub struct VaultAccount {
    pub seller: Pubkey,
    pub available_tokens: u64,
}
