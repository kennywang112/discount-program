pub mod stake_pool;
pub use stake_pool::*;
pub mod stake_entry;
pub use stake_entry::*;
pub mod authorization;
pub use authorization::*;
pub mod reward_distribution;
pub use reward_distribution::*;
pub mod payment;
pub use payment::*;
pub mod discount;
pub use discount::*;

pub mod errors;
pub mod utils;

use anchor_lang::prelude::*;

declare_id!("EMw5PpPu7E92uBKYQbLWv6ioghSDehJr1PL7fDvhC6CK");


#[program]
pub mod cardinal_rewards_center {

    use super::*;

    //// stake_pool ////
    pub fn init_pool(ctx: Context<InitPoolCtx>, ix: InitPoolIx) -> Result<()> { // finish
        stake_pool::init_pool::handler(ctx, ix)
    }
    pub fn update_pool(ctx: Context<UpdatePoolCtx>, ix: UpdatePoolIx) -> Result<()> {
        stake_pool::update_pool::handler(ctx, ix)
    }
    pub fn close_stake_pool(ctx: Context<CloseStakePoolCtx>) -> Result<()> {
        stake_pool::close_stake_pool::handler(ctx)
    }

    pub fn init_discount(ctx: Context<InitDiscountCtx>, ix:InitDiscountIx) -> Result<()> {
        discount::init_discount::handler(ctx, ix)
    }

    //// stake_entry ////
    pub fn init_entry(ctx: Context<InitEntryCtx>, user: Pubkey) -> Result<()> {//
        stake_entry::init_entry::handler(ctx, user)
    }
    pub fn update_total_stake_seconds(ctx: Context<UpdateTotalStakeSecondsCtx>) -> Result<()> {
        stake_entry::update_total_stake_seconds::handler(ctx)
    }
    pub fn reset_stake_entry(ctx: Context<ResetStakeEntryCtx>) -> Result<()> {
        stake_entry::reset_stake_entry::handler(ctx)
    }
    pub fn resize_stake_entry(ctx: Context<ResizeStakeEntryCtx>) -> Result<()> {
        stake_entry::resize_stake_entry::handler(ctx)
    }
    pub fn close_stake_entry(ctx: Context<CloseStakeEntryCtx>) -> Result<()> {
        stake_entry::close_stake_entry::handler(ctx)
    }

    pub fn stake_pnft(ctx: Context<StakePNFTCtx>) -> Result<()> {
        stake_entry::pnfts::stake_pnft::handler(ctx)
    }
    pub fn unstake_pnft(ctx: Context<UnstakePNFTCtx>) -> Result<()> {
        stake_entry::pnfts::unstake_pnft::handler(ctx)
    }

    //// authorization ////
    pub fn authorize_mint(ctx: Context<AuthorizeMintCtx>, mint: Pubkey) -> Result<()> { //finish
        authorization::authorize_mint::handler(ctx, mint)
    }
    pub fn deauthorize_mint(ctx: Context<DeauthorizeMintCtx>) -> Result<()> {
        authorization::deauthorize_mint::handler(ctx)
    }

    //// reward_distribution ////
    //// reward_distribution::reward_distributor ////
    pub fn init_reward_distributor(ctx: Context<InitRewardDistributorCtx>, ix: InitRewardDistributorIx) -> Result<()> {
        reward_distribution::reward_distributor::init_reward_distributor::handler(ctx, ix)
    }
    pub fn update_reward_distributor(ctx: Context<UpdateRewardDistributorCtx>, ix: UpdateRewardDistributorIx) -> Result<()> {
        reward_distribution::reward_distributor::update_reward_distributor::handler(ctx, ix)
    }
    pub fn close_reward_distributor(ctx: Context<CloseRewardDistributorCtx>) -> Result<()> {
        reward_distribution::reward_distributor::close_reward_distributor::handler(ctx)
    }
    pub fn reclaim_funds(ctx: Context<ReclaimFundsCtx>, amount: u64) -> Result<()> {
        reward_distribution::reward_distributor::reclaim_funds::handler(ctx, amount)
    }

    //// reward_distribution::reward_entry ////
    pub fn init_reward_entry(ctx: Context<InitRewardEntryCtx>) -> Result<()> {
        reward_distribution::reward_entry::init_reward_entry::handler(ctx)
    }
    pub fn close_reward_entry(ctx: Context<CloseRewardEntryCtx>) -> Result<()> {
        reward_distribution::reward_entry::close_reward_entry::handler(ctx)
    }
    pub fn update_reward_entry(ctx: Context<UpdateRewardEntryCtx>, ix: UpdateRewardEntryIx) -> Result<()> {
        reward_distribution::reward_entry::update_reward_entry::handler(ctx, ix)
    }
    pub fn claim_rewards(ctx: Context<ClaimRewardsCtx>) -> Result<()> {
        reward_distribution::reward_entry::claim_rewards::handler(ctx)
    }

    //// payment ////
    pub fn init_payment_info(ctx: Context<InitPaymentInfoCtx>, ix: InitPaymentInfoIx) -> Result<()> {//finish
        payment::init_payment_info::handler(ctx, ix)
    }
    pub fn update_payment_info(ctx: Context<UpdatePaymentInfoCtx>, ix: UpdatePaymentInfoIx) -> Result<()> {
        payment::update_payment_info::handler(ctx, ix)
    }
    pub fn close_payment_info(ctx: Context<ClosePaymentInfoCtx>) -> Result<()> {
        payment::close_payment_info::handler(ctx)
    }
}
