/// <reference types="node" />
import type { AccountMeta, Connection, Transaction, TransactionInstruction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { PaymentInfo } from "./constants";
export declare const BASIS_POINTS_DIVISOR = 10000;
export declare const withRemainingAccountsForPaymentInfo: (connection: Connection, transaction: Transaction, payer: PublicKey, paymentInfo: PublicKey) => Promise<AccountMeta[]>;
export declare const withRemainingAccountsForPaymentInfoSync: (transaction: Transaction, payer: PublicKey, paymentInfoData: Pick<PaymentInfo, "parsed" | "pubkey">) => AccountMeta[];
export declare const withRemainingAccountsForPayment: (transaction: Transaction, payer: PublicKey, paymentMint: PublicKey, paymentTargets: PublicKey[]) => AccountMeta[];
export declare const withRemainingAccounts: (instruction: TransactionInstruction, remainingAccounts: AccountMeta[]) => {
    keys: AccountMeta[];
    programId: PublicKey;
    data: Buffer;
};
//# sourceMappingURL=payment.d.ts.map