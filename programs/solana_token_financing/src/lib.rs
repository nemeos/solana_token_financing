use anchor_lang::prelude::*;

use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("5HfozzNSUjtouPPAUJrqPgC4wnwsqg7akvVstjY11Vec");

#[program]
pub mod solana_token_financing {
    use super::*;

    pub fn initialize_token_vault(
        ctx: Context<InitializeTokenAccount>,
        nemeos: Pubkey,
    ) -> Result<()> {
        let vault_account = &mut ctx.accounts.vault_account;
        vault_account.token_account = ctx.accounts.vault_token_account.key();
        vault_account.owner = nemeos;
        vault_account.available_tokens = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeTokenAccount<'info> {
    #[account(
            init_if_needed,
            payer = seller,
            seeds=[b"token_account_owner_pda"],
            bump,
            space = 8
    )]
    token_account_owner_pda: Account<'info, TokenAccountOwnerPda>,

    #[account(
            init,
            payer = seller,
            seeds=[b"nemeos_token_vault", mint.key().as_ref()],
            token::mint=mint,
            token::authority=token_account_owner_pda,
            bump
    )]
    vault_token_account: Account<'info, TokenAccount>,

    #[account(
            init,
            payer = seller,
            seeds=[b"nemeos_vault", mint.key().as_ref()],
            space= 8 + VaultAccount::INIT_SPACE,
            bump
    )]
    vault_account: Account<'info, VaultAccount>,

    mint: Account<'info, Mint>,

    #[account(mut)]
    seller: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
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

#[account]
pub struct TokenAccountOwnerPda {}

#[account]
#[derive(InitSpace)]
pub struct VaultAccount {
    token_account: Pubkey,
    owner: Pubkey, // Nemeos
    available_tokens: u64,
}
