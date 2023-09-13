use anchor_lang::prelude::*;

pub const DISCOUNT_DEFAULT_SIZE: usize = 8 + 32 + 24 + 24;
pub const DISCOUNT_PREFIX: &str = "discount";
#[account]
pub struct StakePool {
    pub bump: u8,
    pub authority: Pubkey,
    pub identifier: String,
    pub discount_str: String,
}
