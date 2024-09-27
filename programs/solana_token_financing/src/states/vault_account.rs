use anchor_lang::prelude::*;

#[account]
pub struct TokenAccountOwnerPda {}

#[account]
#[derive(InitSpace)]
pub struct VaultAccount {
    pub vault_token_account: Pubkey,
    pub nemeos: Pubkey,
    pub available_tokens: u64,
    pub interest_rate: u8,
}
