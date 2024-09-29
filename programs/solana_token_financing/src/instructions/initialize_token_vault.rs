use anchor_lang::prelude::*;

use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::states::vault_account::{TokenAccountOwnerPda, VaultAccount};

pub fn initialize_token_vault(
    ctx: Context<InitializeTokenAccount>,
    annual_interest_rate: u8,
) -> Result<()> {
    // TODO it is the same annual_interest_rate for all loans on this token
    let vault_account = &mut ctx.accounts.vault_account;
    vault_account.nemeos = ctx.accounts.nemeos.key();
    vault_account.seller = ctx.accounts.seller.key();
    vault_account.available_tokens = 0;
    vault_account.annual_interest_rate = annual_interest_rate;
    Ok(())
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
            seeds=[b"nemeos_vault_token_account", mint.key().as_ref()],
            token::mint=mint,
            token::authority=token_account_owner_pda,
            bump
    )]
    vault_token_account: Account<'info, TokenAccount>,

    #[account(
            init,
            payer = seller,
            seeds=[b"nemeos_vault_account", mint.key().as_ref()],
            space= 8 + VaultAccount::INIT_SPACE,
            bump
    )]
    vault_account: Account<'info, VaultAccount>,

    mint: Account<'info, Mint>,

    #[account(mut)]
    seller: Signer<'info>,
    // TODO Nemeos account is saved during this instruction (it could be a constant in the program)
    nemeos: Signer<'info>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}
