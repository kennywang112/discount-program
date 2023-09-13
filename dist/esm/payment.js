import { createAssociatedTokenAccountIdempotentInstruction, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, } from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { fetchIdlAccount } from "./accounts";
export const BASIS_POINTS_DIVISOR = 10000;
export const withRemainingAccountsForPaymentInfo = async (connection, transaction, payer, paymentInfo) => {
    const paymentInfoData = await fetchIdlAccount(connection, paymentInfo, "paymentInfo");
    const remainingAccounts = [
        {
            pubkey: paymentInfo,
            isSigner: false,
            isWritable: false,
        },
    ];
    // add payer
    if (Number(paymentInfoData.parsed.paymentAmount) === 0)
        return remainingAccounts;
    remainingAccounts.push(...withRemainingAccountsForPayment(transaction, payer, paymentInfoData.parsed.paymentMint, paymentInfoData.parsed.paymentShares.map((p) => p.address)));
    return remainingAccounts;
};
export const withRemainingAccountsForPaymentInfoSync = (transaction, payer, paymentInfoData) => {
    const remainingAccounts = [
        {
            pubkey: paymentInfoData.pubkey,
            isSigner: false,
            isWritable: false,
        },
    ];
    // add payer
    if (Number(paymentInfoData.parsed.paymentAmount) === 0)
        return remainingAccounts;
    remainingAccounts.push(...withRemainingAccountsForPayment(transaction, payer, paymentInfoData.parsed.paymentMint, paymentInfoData.parsed.paymentShares.map((p) => p.address)));
    return remainingAccounts;
};
export const withRemainingAccountsForPayment = (transaction, payer, paymentMint, paymentTargets) => {
    const remainingAccounts = [
        {
            pubkey: payer,
            isSigner: true,
            isWritable: true,
        },
    ];
    if (paymentMint.equals(PublicKey.default)) {
        remainingAccounts.push({
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        });
        remainingAccounts.push(...paymentTargets.map((a) => ({
            pubkey: a,
            isSigner: false,
            isWritable: true,
        })));
    }
    else {
        remainingAccounts.push({
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        });
        remainingAccounts.push({
            pubkey: getAssociatedTokenAddressSync(paymentMint, payer, true),
            isSigner: false,
            isWritable: true,
        });
        const ataIds = paymentTargets.map((a) => getAssociatedTokenAddressSync(paymentMint, a, true));
        for (let i = 0; i < ataIds.length; i++) {
            transaction.add(createAssociatedTokenAccountIdempotentInstruction(payer, ataIds[i], paymentTargets[i], paymentMint));
        }
        remainingAccounts.push(...ataIds.map((id) => ({
            pubkey: id,
            isSigner: false,
            isWritable: true,
        })));
    }
    return remainingAccounts;
};
export const withRemainingAccounts = (instruction, remainingAccounts) => {
    return {
        ...instruction,
        keys: [...instruction.keys, ...remainingAccounts],
    };
};
//# sourceMappingURL=payment.js.map