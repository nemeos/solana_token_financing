use anchor_lang::prelude::*;

use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;
use crate::states::vault_account::VaultAccount;

pub fn token_deposit(ctx: Context<TokenDeposit>, amount: u64) -> Result<()> {
    let cpi_accounts = Transfer {
        from: ctx.accounts.seller_token_account.to_account_info(),
        to: ctx.accounts.vault_token_account.to_account_info(),
        authority: ctx.accounts.seller.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_context, amount)?;

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

    #[account(mut)]
    vault_token_account: Account<'info, TokenAccount>,
    #[account(mut, has_one = vault_token_account)]
    vault_account: Account<'info, VaultAccount>,

    token_program: Program<'info, Token>,
}
