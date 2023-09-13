import type { Wallet } from "@coral-xyz/anchor/dist/cjs/provider";
import type { Connection, PublicKey } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import BN from "bn.js";
/**
 * Stake all mints and also initialize entries if not already initialized
 *
 * @param connection
 * @param wallet
 * @param stakePoolIdentifier
 * @param mintInfos
 * @returns
 */
export declare const stake: (connection: Connection, wallet: Wallet, stakePoolIdentifier: string, mintInfos: {
    mintId: PublicKey;
    tokenAccountId?: PublicKey;
    amount?: BN;
    fungible?: boolean;
}[]) => Promise<Transaction[]>;
/**
 * Unstake all mints and also claim rewards from any specified reward distributor(s)
 *
 * @param connection
 * @param wallet
 * @param stakePoolIdentifier
 * @param mintInfos
 * @param rewardDistributorIds
 * @returns
 */
export declare const unstake: (connection: Connection, wallet: Wallet, stakePoolIdentifier: string, mintInfos: {
    mintId: PublicKey;
    fungible?: boolean;
}[], rewardDistributorIds?: PublicKey[]) => Promise<Transaction[]>;
/**
 * Claim reward for all mints from any specified reward distributor(s)
 *
 * @param connection
 * @param wallet
 * @param stakePoolIdentifier
 * @param mintInfos
 * @param rewardDistributorIds
 * @returns
 */
export declare const claimRewards: (connection: Connection, wallet: Wallet, stakePoolIdentifier: string, mintInfos: {
    mintId: PublicKey;
    fungible?: boolean;
}[], rewardDistributorIds?: PublicKey[], claimingRewardsForUsers?: boolean) => Promise<Transaction[]>;
/**
 * Claim reward receipt from a given receipt manager
 *
 * @param connection
 * @param wallet
 * @param stakePoolIdentifier
 * @param mintInfo
 * @param receiptManagerId
 * @returns
 */
export declare const claimRewardReceipt: (connection: Connection, wallet: Wallet, stakePoolIdentifier: string, mintInfo: {
    mintId: PublicKey;
    fungible?: boolean;
}, receiptManagerId: PublicKey) => Promise<Transaction>;
/**
 * Boost a given stake entry using the specified stake booster
 *
 * @param connection
 * @param wallet
 * @param stakePoolIdentifier
 * @param secondsToBoost
 * @param mintInfo
 * @param stakeBoosterIdentifer
 * @returns
 */
export declare const boost: (connection: Connection, wallet: Wallet, stakePoolIdentifier: string, mintInfo: {
    mintId: PublicKey;
    fungible?: boolean;
}, secondsToBoost: number, stakeBoosterIdentifer?: number) => Promise<Transaction>;
//# sourceMappingURL=api.d.ts.map