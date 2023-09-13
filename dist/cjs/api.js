"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boost = exports.claimRewardReceipt = exports.claimRewards = exports.unstake = exports.stake = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@cardinal/common");
const creator_standard_1 = require("@cardinal/creator-standard");
const mpl_token_auth_rules_1 = require("@metaplex-foundation/mpl-token-auth-rules");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = tslib_1.__importDefault(require("bn.js"));
const accounts_1 = require("./accounts");
const authorization_1 = require("./authorization");
const constants_1 = require("./constants");
const payment_1 = require("./payment");
const pda_1 = require("./pda");
const utils_1 = require("./utils");
/**
 * Stake all mints and also initialize entries if not already initialized
 *
 * @param connection
 * @param wallet
 * @param stakePoolIdentifier
 * @param mintInfos
 * @returns
 */
const stake = async (connection, wallet, stakePoolIdentifier, mintInfos) => {
    var _a, _b;
    const stakePoolId = (0, pda_1.findStakePoolId)(stakePoolIdentifier);
    const mints = mintInfos.map(({ mintId, tokenAccountId, amount, fungible }) => {
        return {
            mintId,
            amount,
            stakeEntryId: (0, pda_1.findStakeEntryId)(stakePoolId, mintId, fungible ? wallet.publicKey : undefined),
            mintTokenAccountId: tokenAccountId !== null && tokenAccountId !== void 0 ? tokenAccountId : (0, spl_token_1.getAssociatedTokenAddressSync)(mintId, wallet.publicKey, true),
        };
    });
    const accountDataById = await (0, accounts_1.fetchIdlAccountDataById)(connection, [
        stakePoolId,
        ...mints.map((m) => m.stakeEntryId),
        ...mints.map((m) => (0, creator_standard_1.findMintManagerId)(m.mintId)),
        ...mints.map((m) => (0, utils_1.findMintMetadataId)(m.mintId)),
    ]);
    const stakePoolData = accountDataById[stakePoolId.toString()];
    if (!(stakePoolData === null || stakePoolData === void 0 ? void 0 : stakePoolData.parsed) || stakePoolData.type !== "stakePool") {
        throw "Stake pool not found";
    }
    const stakePaymentInfoData = await (0, accounts_1.fetchIdlAccount)(connection, stakePoolData.parsed.stakePaymentInfo, "paymentInfo");
    const txs = [];
    for (const { mintId, mintTokenAccountId, stakeEntryId, amount } of mints) {
        const tx = new web3_js_1.Transaction();
        const metadataId = (0, utils_1.findMintMetadataId)(mintId);
        const mintManagerId = (0, creator_standard_1.findMintManagerId)(mintId);
        const mintManagerAccountInfo = accountDataById[mintManagerId.toString()];
        const metadataAccountInfo = accountDataById[metadataId.toString()];
        const metadataInfo = metadataAccountInfo
            ? mpl_token_metadata_1.Metadata.fromAccountInfo(metadataAccountInfo)[0]
            : undefined;
        const authorizationAccounts = (0, authorization_1.remainingAccountsForAuthorization)(stakePoolData, mintId, metadataInfo !== null && metadataInfo !== void 0 ? metadataInfo : null);
        if (!accountDataById[stakeEntryId.toString()]) {
            const ix = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                .methods.initEntry(wallet.publicKey)
                .accounts({
                stakeEntry: stakeEntryId,
                stakePool: stakePoolId,
                stakeMint: mintId,
                stakeMintMetadata: metadataId,
                payer: wallet.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .remainingAccounts(authorizationAccounts)
                .instruction();
            tx.add(ix);
        }
        const userEscrowId = (0, pda_1.findUserEscrowId)(wallet.publicKey);
        const remainingAccounts = [
            ...authorizationAccounts,
            ...(0, payment_1.withRemainingAccountsForPaymentInfoSync)(tx, wallet.publicKey, stakePaymentInfoData),
        ];
        if (mintManagerAccountInfo === null || mintManagerAccountInfo === void 0 ? void 0 : mintManagerAccountInfo.data) {
            const mintManager = creator_standard_1.MintManager.fromAccountInfo(mintManagerAccountInfo)[0];
            const stakeIx = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                .methods.stakeCcs(new bn_js_1.default(amount !== null && amount !== void 0 ? amount : 1))
                .accounts({
                stakePool: stakePoolId,
                stakeEntry: stakeEntryId,
                stakeMint: mintId,
                stakeMintMetadata: metadataId,
                stakeMintManager: mintManagerId,
                stakeMintManagerRuleset: mintManager.ruleset,
                user: wallet.publicKey,
                userEscrow: userEscrowId,
                userStakeMintTokenAccount: mintTokenAccountId,
                creatorStandardProgram: creator_standard_1.PROGRAM_ID,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .remainingAccounts(remainingAccounts)
                .instruction();
            tx.add(stakeIx);
        }
        else if (metadataInfo && metadataInfo.programmableConfig) {
            const editionId = (0, utils_1.findMintEditionId)(mintId);
            const stakeTokenRecordAccountId = (0, common_1.findTokenRecordId)(mintId, mintTokenAccountId);
            tx.add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
                units: 100000000,
            }));
            const stakeIx = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                .methods.stakePnft()
                .accountsStrict({
                stakePool: stakePoolId,
                stakeEntry: stakeEntryId,
                stakeMint: mintId,
                stakeMintMetadata: metadataId,
                stakeMintEdition: editionId,
                stakeTokenRecordAccount: stakeTokenRecordAccountId,
                authorizationRules: (_b = (_a = metadataInfo === null || metadataInfo === void 0 ? void 0 : metadataInfo.programmableConfig) === null || _a === void 0 ? void 0 : _a.ruleSet) !== null && _b !== void 0 ? _b : utils_1.METADATA_PROGRAM_ID,
                user: wallet.publicKey,
                userEscrow: userEscrowId,
                userStakeMintTokenAccount: mintTokenAccountId,
                tokenMetadataProgram: utils_1.METADATA_PROGRAM_ID,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
                authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
            })
                .remainingAccounts(remainingAccounts)
                .instruction();
            tx.add(stakeIx);
        }
        else {
            const editionId = (0, utils_1.findMintEditionId)(mintId);
            const stakeIx = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                .methods.stakeEdition(new bn_js_1.default(amount !== null && amount !== void 0 ? amount : 1))
                .accounts({
                stakePool: stakePoolId,
                stakeEntry: stakeEntryId,
                stakeMint: mintId,
                stakeMintEdition: editionId,
                stakeMintMetadata: metadataId,
                user: wallet.publicKey,
                userEscrow: userEscrowId,
                userStakeMintTokenAccount: mintTokenAccountId,
                tokenMetadataProgram: utils_1.METADATA_PROGRAM_ID,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .remainingAccounts(remainingAccounts)
                .instruction();
            tx.add(stakeIx);
        }
        txs.push(tx);
    }
    return txs;
};
exports.stake = stake;
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
const unstake = async (connection, wallet, stakePoolIdentifier, mintInfos, rewardDistributorIds) => {
    var _a, _b;
    const stakePoolId = (0, pda_1.findStakePoolId)(stakePoolIdentifier);
    const mints = mintInfos.map(({ mintId, fungible }) => {
        const stakeEntryId = (0, pda_1.findStakeEntryId)(stakePoolId, mintId, fungible ? wallet.publicKey : undefined);
        return {
            mintId,
            stakeEntryId,
            rewardEntryIds: rewardDistributorIds === null || rewardDistributorIds === void 0 ? void 0 : rewardDistributorIds.map((rewardDistributorId) => (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId)),
        };
    });
    let accountDataById = await (0, accounts_1.fetchIdlAccountDataById)(connection, [
        stakePoolId,
        ...(rewardDistributorIds !== null && rewardDistributorIds !== void 0 ? rewardDistributorIds : []),
        ...mints.map((m) => { var _a; return (_a = m.rewardEntryIds) !== null && _a !== void 0 ? _a : []; }).flat(),
        ...mints.map((m) => (0, creator_standard_1.findMintManagerId)(m.mintId)),
        ...mints.map((m) => m.stakeEntryId),
    ]);
    const stakePoolData = accountDataById[stakePoolId.toString()];
    if (!(stakePoolData === null || stakePoolData === void 0 ? void 0 : stakePoolData.parsed) || stakePoolData.type !== "stakePool") {
        throw "Stake pool not found";
    }
    const claimRewardsPaymentInfoIds = rewardDistributorIds === null || rewardDistributorIds === void 0 ? void 0 : rewardDistributorIds.map((id) => {
        const rewardDistributorData = accountDataById[id.toString()];
        if (rewardDistributorData &&
            rewardDistributorData.type === "rewardDistributor") {
            return rewardDistributorData.parsed.claimRewardsPaymentInfo;
        }
        return null;
    });
    const accountDataById2 = await (0, accounts_1.fetchIdlAccountDataById)(connection, [
        stakePoolData.parsed.unstakePaymentInfo,
        ...(claimRewardsPaymentInfoIds !== null && claimRewardsPaymentInfoIds !== void 0 ? claimRewardsPaymentInfoIds : []),
    ]);
    accountDataById = { ...accountDataById, ...accountDataById2 };
    const txs = [];
    for (const { mintId, stakeEntryId, rewardEntryIds } of mints) {
        const tx = new web3_js_1.Transaction();
        const userEscrowId = (0, pda_1.findUserEscrowId)(wallet.publicKey);
        const userAtaId = (0, spl_token_1.getAssociatedTokenAddressSync)(mintId, wallet.publicKey);
        const stakeEntry = accountDataById[stakeEntryId.toString()];
        if (rewardEntryIds &&
            rewardDistributorIds &&
            (rewardDistributorIds === null || rewardDistributorIds === void 0 ? void 0 : rewardDistributorIds.length) > 0 &&
            !((stakeEntry === null || stakeEntry === void 0 ? void 0 : stakeEntry.type) === "stakeEntry" &&
                stakeEntry.parsed.cooldownStartSeconds)) {
            const ix = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                .methods.updateTotalStakeSeconds()
                .accounts({
                stakeEntry: stakeEntryId,
                updater: wallet.publicKey,
            })
                .instruction();
            tx.add(ix);
            for (let j = 0; j < rewardDistributorIds.length; j++) {
                const rewardDistributorId = rewardDistributorIds[j];
                const rewardDistributorData = accountDataById[rewardDistributorId.toString()];
                const rewardEntryId = rewardEntryIds[j];
                if (rewardEntryId &&
                    rewardDistributorData &&
                    rewardDistributorData.type === "rewardDistributor") {
                    const rewardMint = rewardDistributorData.parsed.rewardMint;
                    const rewardEntry = accountDataById[rewardEntryId === null || rewardEntryId === void 0 ? void 0 : rewardEntryId.toString()];
                    const rewardDistributorTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(rewardMint, rewardDistributorId, true);
                    const userRewardMintTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(rewardMint, wallet.publicKey, true);
                    if (!rewardEntry) {
                        const ix = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                            .methods.initRewardEntry()
                            .accounts({
                            rewardEntry: (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId),
                            rewardDistributor: rewardDistributorId,
                            stakeEntry: stakeEntryId,
                            payer: wallet.publicKey,
                        })
                            .instruction();
                        tx.add(ix);
                    }
                    const remainingAccountsForPayment = [];
                    const claimRewardsPaymentInfo = accountDataById[rewardDistributorData.parsed.claimRewardsPaymentInfo.toString()];
                    if (claimRewardsPaymentInfo &&
                        claimRewardsPaymentInfo.type === "paymentInfo") {
                        remainingAccountsForPayment.push(...(0, payment_1.withRemainingAccountsForPaymentInfoSync)(tx, wallet.publicKey, claimRewardsPaymentInfo));
                    }
                    const ix = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                        .methods.claimRewards()
                        .accounts({
                        rewardEntry: (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId),
                        rewardDistributor: rewardDistributorId,
                        stakeEntry: stakeEntryId,
                        stakePool: stakePoolId,
                        rewardMint: rewardMint,
                        userRewardMintTokenAccount: userRewardMintTokenAccount,
                        rewardDistributorTokenAccount: rewardDistributorTokenAccount,
                        user: wallet.publicKey,
                    })
                        .remainingAccounts(remainingAccountsForPayment)
                        .instruction();
                    tx.add(ix);
                }
            }
        }
        const remainingAccounts = [];
        const unstakePaymentInfo = accountDataById[stakePoolData.parsed.unstakePaymentInfo.toString()];
        if (unstakePaymentInfo && unstakePaymentInfo.type === "paymentInfo") {
            remainingAccounts.push(...(0, payment_1.withRemainingAccountsForPaymentInfoSync)(tx, wallet.publicKey, unstakePaymentInfo));
        }
        const mintManagerId = (0, creator_standard_1.findMintManagerId)(mintId);
        const mintManagerAccountInfo = accountDataById[mintManagerId.toString()];
        const metadataId = (0, utils_1.findMintMetadataId)(mintId);
        const metadata = await (0, common_1.tryNull)(mpl_token_metadata_1.Metadata.fromAccountAddress(connection, metadataId));
        if (mintManagerAccountInfo === null || mintManagerAccountInfo === void 0 ? void 0 : mintManagerAccountInfo.data) {
            const ix = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                .methods.unstakeCcs()
                .accounts({
                stakeEntry: stakeEntryId,
                stakePool: stakePoolId,
                stakeMint: mintId,
                stakeMintManager: mintManagerId,
                user: wallet.publicKey,
                userEscrow: userEscrowId,
                userStakeMintTokenAccount: userAtaId,
                creatorStandardProgram: creator_standard_1.PROGRAM_ID,
            })
                .remainingAccounts(remainingAccounts)
                .instruction();
            tx.add(ix);
        }
        else if (metadata === null || metadata === void 0 ? void 0 : metadata.programmableConfig) {
            const editionId = (0, utils_1.findMintEditionId)(mintId);
            const stakeTokenRecordAccountId = (0, common_1.findTokenRecordId)(mintId, userAtaId);
            tx.add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
                units: 100000000,
            }));
            const unstakeIx = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                .methods.unstakePnft()
                .accountsStrict({
                stakePool: stakePoolId,
                stakeEntry: stakeEntryId,
                stakeMint: mintId,
                stakeMintMetadata: metadataId,
                stakeMintEdition: editionId,
                stakeTokenRecordAccount: stakeTokenRecordAccountId,
                authorizationRules: (_b = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.programmableConfig) === null || _a === void 0 ? void 0 : _a.ruleSet) !== null && _b !== void 0 ? _b : utils_1.METADATA_PROGRAM_ID,
                user: wallet.publicKey,
                userEscrow: userEscrowId,
                userStakeMintTokenAccount: userAtaId,
                tokenMetadataProgram: utils_1.METADATA_PROGRAM_ID,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
                authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
            })
                .remainingAccounts(remainingAccounts)
                .instruction();
            tx.add(unstakeIx);
        }
        else {
            const editionId = (0, utils_1.findMintEditionId)(mintId);
            const ix = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                .methods.unstakeEdition()
                .accounts({
                stakeEntry: stakeEntryId,
                stakePool: stakePoolId,
                stakeMint: mintId,
                stakeMintEdition: editionId,
                user: wallet.publicKey,
                userEscrow: userEscrowId,
                userStakeMintTokenAccount: userAtaId,
                tokenMetadataProgram: utils_1.METADATA_PROGRAM_ID,
            })
                .remainingAccounts(remainingAccounts)
                .instruction();
            tx.add(ix);
        }
        txs.push(tx);
    }
    return txs;
};
exports.unstake = unstake;
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
const claimRewards = async (connection, wallet, stakePoolIdentifier, mintInfos, rewardDistributorIds, claimingRewardsForUsers) => {
    const stakePoolId = (0, pda_1.findStakePoolId)(stakePoolIdentifier);
    const mints = mintInfos.map(({ mintId, fungible }) => {
        const stakeEntryId = (0, pda_1.findStakeEntryId)(stakePoolId, mintId, fungible ? wallet.publicKey : undefined);
        return {
            mintId,
            stakeEntryId,
            rewardEntryIds: rewardDistributorIds === null || rewardDistributorIds === void 0 ? void 0 : rewardDistributorIds.map((rewardDistributorId) => (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId)),
        };
    });
    let accountDataById = await (0, accounts_1.fetchIdlAccountDataById)(connection, [
        ...(rewardDistributorIds !== null && rewardDistributorIds !== void 0 ? rewardDistributorIds : []),
        ...mints.map((m) => { var _a; return (_a = m.rewardEntryIds) !== null && _a !== void 0 ? _a : []; }).flat(),
        ...(claimingRewardsForUsers
            ? mints.map((m) => (0, pda_1.findStakeEntryId)(stakePoolId, m.mintId)).flat()
            : []),
    ]);
    const claimRewardsPaymentInfoIds = rewardDistributorIds === null || rewardDistributorIds === void 0 ? void 0 : rewardDistributorIds.map((id) => {
        const rewardDistributorData = accountDataById[id.toString()];
        if (rewardDistributorData &&
            rewardDistributorData.type === "rewardDistributor") {
            return rewardDistributorData.parsed.claimRewardsPaymentInfo;
        }
        return null;
    });
    const accountDataById2 = await (0, accounts_1.fetchIdlAccountDataById)(connection, [
        ...(claimRewardsPaymentInfoIds !== null && claimRewardsPaymentInfoIds !== void 0 ? claimRewardsPaymentInfoIds : []),
    ]);
    accountDataById = { ...accountDataById, ...accountDataById2 };
    const txs = [];
    for (const { stakeEntryId, rewardEntryIds } of mints) {
        const tx = new web3_js_1.Transaction();
        if (rewardEntryIds &&
            rewardDistributorIds &&
            (rewardDistributorIds === null || rewardDistributorIds === void 0 ? void 0 : rewardDistributorIds.length) > 0) {
            const ix = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                .methods.updateTotalStakeSeconds()
                .accounts({
                stakeEntry: stakeEntryId,
                updater: wallet.publicKey,
            })
                .instruction();
            tx.add(ix);
            for (let j = 0; j < rewardDistributorIds.length; j++) {
                const rewardDistributorId = rewardDistributorIds[j];
                const rewardDistributorData = accountDataById[rewardDistributorId.toString()];
                const rewardEntryId = rewardEntryIds[j];
                if (rewardEntryId &&
                    rewardDistributorData &&
                    rewardDistributorData.type === "rewardDistributor") {
                    const rewardMint = rewardDistributorData.parsed.rewardMint;
                    const rewardEntry = accountDataById[rewardEntryId === null || rewardEntryId === void 0 ? void 0 : rewardEntryId.toString()];
                    const rewardDistributorTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(rewardMint, rewardDistributorId, true);
                    const stakeEntryDataInfo = accountDataById[stakeEntryId.toString()];
                    const userRewardMintTokenAccountOwnerId = stakeEntryDataInfo
                        ? (0, accounts_1.decodeIdlAccount)(stakeEntryDataInfo, "stakeEntry").parsed
                            .lastStaker
                        : wallet.publicKey;
                    const userRewardMintTokenAccount = await (0, common_1.findAta)(rewardMint, userRewardMintTokenAccountOwnerId, true);
                    tx.add((0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(wallet.publicKey, userRewardMintTokenAccount, userRewardMintTokenAccountOwnerId, rewardMint));
                    if (!rewardEntry) {
                        const ix = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                            .methods.initRewardEntry()
                            .accounts({
                            rewardEntry: (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId),
                            rewardDistributor: rewardDistributorId,
                            stakeEntry: stakeEntryId,
                            payer: wallet.publicKey,
                        })
                            .instruction();
                        tx.add(ix);
                    }
                    const remainingAccountsForPayment = [];
                    const unstakePaymentInfo = accountDataById[rewardDistributorData.parsed.claimRewardsPaymentInfo.toString()];
                    if (unstakePaymentInfo && unstakePaymentInfo.type === "paymentInfo") {
                        remainingAccountsForPayment.push(...(0, payment_1.withRemainingAccountsForPaymentInfoSync)(tx, wallet.publicKey, unstakePaymentInfo));
                    }
                    const ix = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
                        .methods.claimRewards()
                        .accounts({
                        rewardEntry: (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId),
                        rewardDistributor: rewardDistributorId,
                        stakeEntry: stakeEntryId,
                        stakePool: stakePoolId,
                        rewardMint: rewardMint,
                        userRewardMintTokenAccount: userRewardMintTokenAccount,
                        rewardDistributorTokenAccount: rewardDistributorTokenAccount,
                        user: wallet.publicKey,
                    })
                        .remainingAccounts(remainingAccountsForPayment)
                        .instruction();
                    tx.add(ix);
                }
            }
        }
        txs.push(tx);
    }
    return txs;
};
exports.claimRewards = claimRewards;
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
const claimRewardReceipt = async (connection, wallet, stakePoolIdentifier, mintInfo, receiptManagerId) => {
    var _a;
    const stakePoolId = (0, pda_1.findStakePoolId)(stakePoolIdentifier);
    const stakeEntryId = (0, pda_1.findStakeEntryId)(stakePoolId, mintInfo.mintId, mintInfo.fungible ? wallet.publicKey : undefined);
    const rewardReceiptId = (0, pda_1.findRewardReceiptId)(receiptManagerId, stakeEntryId);
    const accountDataById = await (0, accounts_1.fetchIdlAccountDataById)(connection, [
        receiptManagerId,
        rewardReceiptId,
    ]);
    const receiptManagerData = accountDataById[receiptManagerId.toString()];
    if (!(receiptManagerData === null || receiptManagerData === void 0 ? void 0 : receiptManagerData.parsed) ||
        receiptManagerData.type !== "receiptManager") {
        throw "Receipt manager not found";
    }
    const tx = new web3_js_1.Transaction();
    const ix = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
        .methods.updateTotalStakeSeconds()
        .accounts({
        stakeEntry: stakeEntryId,
        updater: wallet.publicKey,
    })
        .instruction();
    tx.add(ix);
    if (!((_a = accountDataById[rewardReceiptId.toString()]) === null || _a === void 0 ? void 0 : _a.parsed)) {
        const ix = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
            .methods.initRewardReceipt()
            .accounts({
            rewardReceipt: rewardReceiptId,
            receiptManager: receiptManagerId,
            stakeEntry: stakeEntryId,
            payer: wallet.publicKey,
        })
            .instruction();
        tx.add(ix);
    }
    const remainingAccountsForPayment = (0, payment_1.withRemainingAccountsForPayment)(tx, wallet.publicKey, receiptManagerData.parsed.paymentMint, receiptManagerData.parsed.paymentShares.map((p) => p.address));
    const remainingAccountsForAction = await (0, payment_1.withRemainingAccountsForPaymentInfo)(connection, tx, wallet.publicKey, receiptManagerData.parsed.claimActionPaymentInfo);
    const rewardReceiptIx = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
        .methods.claimRewardReceipt()
        .accounts({
        rewardReceipt: rewardReceiptId,
        receiptManager: receiptManagerId,
        stakeEntry: stakeEntryId,
        payer: wallet.publicKey,
        claimer: wallet.publicKey,
    })
        .remainingAccounts([
        ...remainingAccountsForPayment,
        ...remainingAccountsForAction,
    ])
        .instruction();
    tx.add(rewardReceiptIx);
    return tx;
};
exports.claimRewardReceipt = claimRewardReceipt;
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
const boost = async (connection, wallet, stakePoolIdentifier, mintInfo, secondsToBoost, stakeBoosterIdentifer) => {
    const stakePoolId = (0, pda_1.findStakePoolId)(stakePoolIdentifier);
    const stakeEntryId = (0, pda_1.findStakeEntryId)(stakePoolId, mintInfo.mintId, mintInfo.fungible ? wallet.publicKey : undefined);
    const stakeBoosterId = (0, pda_1.findStakeBoosterId)(stakePoolId, stakeBoosterIdentifer ? new bn_js_1.default(stakeBoosterIdentifer) : undefined);
    const accountDataById = await (0, accounts_1.fetchIdlAccountDataById)(connection, [
        stakeBoosterId,
    ]);
    const stakeBoosterData = accountDataById[stakeBoosterId.toString()];
    if (!(stakeBoosterData === null || stakeBoosterData === void 0 ? void 0 : stakeBoosterData.parsed) || stakeBoosterData.type !== "stakeBooster") {
        throw "Stake booster not found";
    }
    const tx = new web3_js_1.Transaction();
    const ix = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
        .methods.updateTotalStakeSeconds()
        .accounts({
        stakeEntry: stakeEntryId,
        updater: wallet.publicKey,
    })
        .instruction();
    tx.add(ix);
    const remainingAccountsForPayment = (0, payment_1.withRemainingAccountsForPayment)(tx, wallet.publicKey, stakeBoosterData.parsed.paymentMint, stakeBoosterData.parsed.paymentShares.map((p) => p.address));
    const remainingAccountsForAction = await (0, payment_1.withRemainingAccountsForPaymentInfo)(connection, tx, wallet.publicKey, stakeBoosterData.parsed.boostActionPaymentInfo);
    const boostIx = await (0, constants_1.rewardsCenterProgram)(connection, wallet)
        .methods.boostStakeEntry({ secondsToBoost: new bn_js_1.default(secondsToBoost) })
        .accounts({
        stakePool: stakePoolId,
        stakeBooster: stakeBoosterId,
        stakeEntry: stakeEntryId,
        stakeMint: mintInfo.mintId,
    })
        .remainingAccounts([
        ...remainingAccountsForPayment,
        ...remainingAccountsForAction,
    ])
        .instruction();
    tx.add(boostIx);
    return tx;
};
exports.boost = boost;
//# sourceMappingURL=api.js.map