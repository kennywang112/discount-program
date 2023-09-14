use crate::utils::resize_account;
use crate::Discount;
use crate::DISCOUNT_DEFAULT_SIZE;
use crate::DISCOUNT_PREFIX;
use anchor_lang::prelude::*;
// use std::str::FromStr;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitDiscountIx {
    discount_str: String,
    authority: Pubkey,
    identifier: String,
}

#[derive(Accounts)]
#[instruction(ix: InitDiscountIx)]
pub struct InitDiscountCtx<'info> {
    #[account(
        init,
        payer = payer,
        space = DISCOUNT_DEFAULT_SIZE,
        seeds = [DISCOUNT_PREFIX.as_bytes(), ix.identifier.as_ref()],
        bump
    )]
    discount_data: Account<'info, Discount>,

    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitDiscountCtx>, 
    ix: InitDiscountIx
) -> Result<()> {
    // let bump = *ctx.bumps.get("discount_prefix").unwrap();
    let identifier = ix.identifier;
    let new_discount_data = Discount {
        // bump,
        discount_str: ix.discount_str,
        authority: ix.authority,
        identifier,
    };

    let discount_data = &mut ctx.accounts.discount_data;
    let new_space = new_discount_data.try_to_vec()?.len() + 8;

    resize_account(
        &discount_data.to_account_info(),
        new_space,
        &ctx.accounts.payer.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
    )?;

    discount_data.set_inner(new_discount_data);
    Ok(())
}
