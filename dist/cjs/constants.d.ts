import type { IdlAccountData as cIdlAccountData } from "@cardinal/common";
import { Program } from "@coral-xyz/anchor";
import type { AllAccountsMap } from "@coral-xyz/anchor/dist/cjs/program/namespace/types";
import type { Wallet } from "@coral-xyz/anchor/dist/cjs/provider";
import type { ConfirmOptions, Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { CardinalRewardsCenter } from "./idl/cardinal_rewards_center";
export declare const REWARDS_CENTER_IDL: CardinalRewardsCenter;
export declare const REWARDS_CENTER_ADDRESS: PublicKey;
export declare const WRAPPED_SOL_PAYMENT_INFO: PublicKey;
export declare const SOL_PAYMENT_INFO: PublicKey;
export declare const DEFAULT_PAYMENT_INFO: PublicKey;
export type IdlAccountData<T extends keyof AllAccountsMap<CardinalRewardsCenter>> = cIdlAccountData<T, CardinalRewardsCenter>;
export type RewardDistributor = IdlAccountData<"rewardDistributor">;
export type RewardEntry = IdlAccountData<"rewardEntry">;
export type StakePool = IdlAccountData<"stakePool">;
export type StakeEntry = IdlAccountData<"stakeEntry">;
export type ReceiptManager = IdlAccountData<"receiptManager">;
export type RewardReceipt = IdlAccountData<"rewardReceipt">;
export type StakeBooster = IdlAccountData<"stakeBooster">;
export type StakeAuthorizationRecord = IdlAccountData<"stakeAuthorizationRecord">;
export type PaymentInfo = IdlAccountData<"paymentInfo">;
export type PaymentShare = {
    address: PublicKey;
    basisPoints: number;
};
export declare const rewardsCenterProgram: (connection: Connection, wallet?: Wallet, opts?: ConfirmOptions) => Program<CardinalRewardsCenter>;
//# sourceMappingURL=constants.d.ts.map