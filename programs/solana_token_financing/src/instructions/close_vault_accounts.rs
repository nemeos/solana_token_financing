use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::states::vault_account::{TokenAccountOwnerPda, VaultAccount};

pub fn close_vault_accounts(ctx: Context<CloseVaultAccounts>) -> Result<()> {
    let vault_account = &ctx.accounts.vault_account;
    let token_vault_account = &ctx.accounts.vault_token_account;

    if vault_account.seller != ctx.accounts.seller_token_account.owner {
        return Err(ErrorCode::WrongReceiver.into());
    }

    if vault_account.available_tokens == token_vault_account.amount {
        if token_vault_account.amount > 0 {
            // Transfer tokens to the seller
            let transfer_instruction = Transfer {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.seller_token_account.to_account_info(),
                authority: ctx.accounts.token_account_owner_pda.to_account_info(),
            };
            let bump = ctx.bumps.token_account_owner_pda;
            let seeds = &[b"token_account_owner_pda".as_ref(), &[bump]];
            let signer = &[&seeds[..]];
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_instruction,
                signer,
            );
            token::transfer(cpi_ctx, token_vault_account.amount)?;
        }
        // Close vault accounts
        return Ok(());
    }

    // Do not close the vault accounts
    Err(ErrorCode::ImpossibleToCloseVaultAccounts.into())
}

#[derive(Accounts)]
pub struct CloseVaultAccounts<'info> {
    #[account(
        seeds=[b"token_account_owner_pda"],
        bump
    )]
    token_account_owner_pda: Account<'info, TokenAccountOwnerPda>,

    #[account(
            mut,
            // TODO fix close
            // close = seller,
            seeds=[b"nemeos_vault_token_account", mint.key().as_ref()],
            bump
    )]
    vault_token_account: Account<'info, TokenAccount>,

    #[account(
            mut,
            close = seller,
            seeds=[b"nemeos_vault_account", mint.key().as_ref()],
            bump,
    )]
    vault_account: Account<'info, VaultAccount>,

    #[account(mut)]
    seller: Signer<'info>,
    #[account(mut)]
    seller_token_account: Account<'info, TokenAccount>,

    mint: Account<'info, Mint>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}
