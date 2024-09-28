use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::states::vault_account::VaultAccount;

pub fn token_deposit(ctx: Context<TokenDeposit>, amount: u64) -> Result<()> {
    let token_amount = amount * 10u64.pow(ctx.accounts.mint.decimals as u32);
    let cpi_accounts = Transfer {
        from: ctx.accounts.seller_token_account.to_account_info(),
        to: ctx.accounts.vault_token_account.to_account_info(),
        authority: ctx.accounts.seller.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_context, token_amount)?;

    let vault_account = &mut ctx.accounts.vault_account;
    vault_account.available_tokens = vault_account
        .available_tokens
        .checked_add(amount)
        .ok_or(ErrorCode::Overflow)?;

    Ok(())
}

#[derive(Accounts)]
pub struct TokenDeposit<'info> {
    #[account(mut)]
    seller_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    seller: Signer<'info>,

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
            has_one = seller,
    )]
    vault_account: Account<'info, VaultAccount>,

    mint: Account<'info, Mint>,

    token_program: Program<'info, Token>,
}
