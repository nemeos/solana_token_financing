use anchor_lang::prelude::*;

use crate::states::vault_account::TokenAccountOwnerPda;
use anchor_spl::token::Token;

pub fn initialize_token_account_owner_pda(
    _ctx: Context<InitializeTokenAccountOwnerPda>,
) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeTokenAccountOwnerPda<'info> {
    #[account(
            init_if_needed,
            payer = nemeos,
            seeds=[b"token_account_owner_pda"],
            bump,
            space = 8
    )]
    token_account_owner_pda: Account<'info, TokenAccountOwnerPda>,

    #[account(mut)]
    nemeos: Signer<'info>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}
