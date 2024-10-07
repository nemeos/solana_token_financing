use anchor_lang::prelude::*;

use crate::constants::NEMEOS_PUBKEY;
use crate::states::vault_account::{TokenAccountOwnerPda, VaultAccount};
use anchor_spl::token::{Mint, Token, TokenAccount};

pub fn initialize_token_vault(ctx: Context<InitializeTokenAccount>) -> Result<()> {
    if ctx.accounts.nemeos.key() != NEMEOS_PUBKEY {
        return Err(crate::errors::ErrorCode::NemeosInstruction.into());
    }
    let vault_account = &mut ctx.accounts.vault_account;
    vault_account.seller = ctx.accounts.seller.key();
    vault_account.available_tokens = 0;
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeTokenAccount<'info> {
    #[account(
            seeds=[b"token_account_owner_pda"],
            bump,
    )]
    token_account_owner_pda: Account<'info, TokenAccountOwnerPda>,

    #[account(
            init,
            payer = nemeos,
            seeds=[b"nemeos_vault_token_account", mint.key().as_ref()],
            token::mint=mint,
            token::authority=token_account_owner_pda,
            bump
    )]
    vault_token_account: Account<'info, TokenAccount>,

    #[account(
            init,
            payer = nemeos,
            seeds=[b"nemeos_vault_account", mint.key().as_ref()],
            space= 8 + VaultAccount::INIT_SPACE,
            bump
    )]
    vault_account: Account<'info, VaultAccount>,

    mint: Account<'info, Mint>,

    seller: SystemAccount<'info>,
    #[account(mut)]
    nemeos: Signer<'info>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}
