import type { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import type { PublicKey } from "@solana/web3.js";
import type { StakePool } from "./constants";
export declare const remainingAccountsForAuthorization: (stakePool: Pick<StakePool, "parsed" | "pubkey">, mintId: PublicKey, mintMetadata: Metadata | null) => {
    pubkey: PublicKey;
    isSigner: boolean;
    isWritable: boolean;
}[];
//# sourceMappingURL=authorization.d.ts.map