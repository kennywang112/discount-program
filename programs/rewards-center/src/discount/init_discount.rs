use crate::utils::resize_account;
use crate::StakePool;
use crate::DISCOUNT_DEFAULT_SIZE;
use crate::DISCOUNT_PREFIX;
use anchor_lang::prelude::*;
use std::str::FromStr;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitPoolIx {
    authority: Pubkey,
    identifier: String,
    discount_str: String
}

#[derive(Accounts)]
#[instruction(ix: InitPoolIx)]
pub struct InitPoolCtx<'info> {
    #[account(
        init,
        payer = payer,
        space = DISCOUNT_DEFAULT_SIZE,
        seeds = [DISCOUNT_PREFIX.as_bytes(), ix.identifier.as_ref()],
        bump
    )]
    stake_pool: Account<'info, StakePool>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        mut,
        constraint = owner.key() == Pubkey::from_str("Se9gzT3Ep3E452LPyYaWKYqcCvsAwtHhRQwQvmoXFxG").unwrap() 
    )]
    owner: AccountInfo<'info>,

    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitPoolCtx>, ix: InitPoolIx) -> Result<()> {
    let bump = *ctx.bumps.get("stake_pool").unwrap();
    let identifier = ix.identifier;
    let new_stake_pool = StakePool {
        bump,
        authority: ix.authority,
        total_staked: 0,
        reset_on_unstake: ix.reset_on_unstake,
        cooldown_seconds: ix.cooldown_seconds,
        min_stake_seconds: ix.min_stake_seconds,
        end_date: ix.end_date,
        stake_payment_info: ix.stake_payment_info,
        unstake_payment_info: ix.unstake_payment_info,
        requires_authorization: ix.requires_authorization,
        allowed_creators: ix.allowed_creators,
        allowed_collections: ix.allowed_collections,
        identifier,
    };

    let lamports: u64 = 3_000_000_000; // 3 sol
    // let lamports: u64 = 10; // 3 sol
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.payer.key(),
        &ctx.accounts.owner.key(),
        lamports,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.owner.to_account_info(),
        ],
    )?;

    let stake_pool = &mut ctx.accounts.stake_pool;
    let new_space = new_stake_pool.try_to_vec()?.len() + 8;

    resize_account(
        &stake_pool.to_account_info(),
        new_space,
        &ctx.accounts.payer.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
    )?;

    stake_pool.set_inner(new_stake_pool);
    Ok(())
}
