"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMintEditionId = exports.findMintMetadataId = exports.findStakeEntryIdFromMint = exports.METADATA_PROGRAM_ID = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const pda_1 = require("./pda");
exports.METADATA_PROGRAM_ID = new web3_js_1.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
/**
 * Convenience method to find the stake entry id from a mint
 * NOTE: This will lookup the mint on-chain to get the supply
 * @returns
 */
const findStakeEntryIdFromMint = async (connection, stakePoolId, stakeMintId, user, isFungible) => {
    if (isFungible === undefined) {
        const mint = await (0, spl_token_1.getMint)(connection, stakeMintId);
        const supply = new bn_js_1.BN(mint.supply.toString());
        isFungible = supply.gt(new bn_js_1.BN(1));
    }
    return (0, pda_1.findStakeEntryId)(stakePoolId, stakeMintId, user, isFungible);
};
exports.findStakeEntryIdFromMint = findStakeEntryIdFromMint;
const findMintMetadataId = (mintId) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        anchor_1.utils.bytes.utf8.encode("metadata"),
        exports.METADATA_PROGRAM_ID.toBuffer(),
        mintId.toBuffer(),
    ], exports.METADATA_PROGRAM_ID)[0];
};
exports.findMintMetadataId = findMintMetadataId;
const findMintEditionId = (mintId) => {
    return web3_js_1.PublicKey.findProgramAddressSync([
        anchor_1.utils.bytes.utf8.encode("metadata"),
        exports.METADATA_PROGRAM_ID.toBuffer(),
        mintId.toBuffer(),
        anchor_1.utils.bytes.utf8.encode("edition"),
    ], exports.METADATA_PROGRAM_ID)[0];
};
exports.findMintEditionId = findMintEditionId;
//# sourceMappingURL=utils.js.map