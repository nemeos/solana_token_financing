use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::states::vault_account::{TokenAccountOwnerPda, VaultAccount};

pub fn token_withdraw(ctx: Context<TokenWithdraw>, amount: u64) -> Result<()> {
    let vault_account = &mut ctx.accounts.vault_account;

    if vault_account.seller != ctx.accounts.seller_token_account.owner {
        return Err(ErrorCode::WrongReceiver.into());
    }

    if vault_account.available_tokens < amount {
        return Err(ErrorCode::NotEnoughAvailableTokens.into());
    }

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
    token::transfer(cpi_ctx, amount)?;

    vault_account.available_tokens -= amount;

    Ok(())
}

#[derive(Accounts)]
pub struct TokenWithdraw<'info> {
    #[account(
        seeds=[b"token_account_owner_pda"],
        bump
    )]
    token_account_owner_pda: Account<'info, TokenAccountOwnerPda>,

    #[account(
        mut,
        seeds=[b"nemeos_vault_token_account", mint.key().as_ref()],
        bump
    )]
    vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
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
