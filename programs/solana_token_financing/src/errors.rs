use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("An overflow occurred.")]
    Overflow,

    #[msg("The vault token account does not match the vault account.")]
    InvalidVaultTokenAccount,
}
