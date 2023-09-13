import { utils } from "@coral-xyz/anchor";
import { getMint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { findStakeEntryId } from "./pda";
export const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
/**
 * Convenience method to find the stake entry id from a mint
 * NOTE: This will lookup the mint on-chain to get the supply
 * @returns
 */
export const findStakeEntryIdFromMint = async (connection, stakePoolId, stakeMintId, user, isFungible) => {
    if (isFungible === undefined) {
        const mint = await getMint(connection, stakeMintId);
        const supply = new BN(mint.supply.toString());
        isFungible = supply.gt(new BN(1));
    }
    return findStakeEntryId(stakePoolId, stakeMintId, user, isFungible);
};
export const findMintMetadataId = (mintId) => {
    return PublicKey.findProgramAddressSync([
        utils.bytes.utf8.encode("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintId.toBuffer(),
    ], METADATA_PROGRAM_ID)[0];
};
export const findMintEditionId = (mintId) => {
    return PublicKey.findProgramAddressSync([
        utils.bytes.utf8.encode("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintId.toBuffer(),
        utils.bytes.utf8.encode("edition"),
    ], METADATA_PROGRAM_ID)[0];
};
//# sourceMappingURL=utils.js.map