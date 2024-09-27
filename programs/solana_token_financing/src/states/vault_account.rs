use anchor_lang::prelude::*;

#[account]
pub struct TokenAccountOwnerPda {}

#[account]
#[derive(InitSpace)]
pub struct VaultAccount {
    pub token_account: Pubkey,
    pub owner: Pubkey, // Nemeos
    pub available_tokens: u64,
}
