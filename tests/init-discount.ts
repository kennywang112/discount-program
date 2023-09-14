import { executeTransaction, fetchIdlAccount } from "@cardinal/common";
import { 
  SystemProgram, 
  Transaction, 
  PublicKey, 
  Connection, 
  Commitment, 
  LAMPORTS_PER_SOL, 
  Keypair 
} from "@solana/web3.js";
import {
  findStakePoolId,
  SOL_PAYMENT_INFO,
} from "../sdk";
import { assert } from "chai";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import * as anchor from "@coral-xyz/anchor";
import { IDL } from "../target/types/cardinal_rewards_center";
import { BN, utils } from "@coral-xyz/anchor";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

describe("Pool", () => {

    let discountIdentifier = `test`;
    const options = anchor.AnchorProvider.defaultOptions();
    const commitment: Commitment = "processed";
    let connection = new Connection("http://localhost:8899", {
        commitment,
        wsEndpoint: "ws://localhost:8900/",
      });
    const wallet = NodeWallet.local();
    let provider = new anchor.AnchorProvider(connection, wallet, options);
    const programId = new PublicKey("EMw5PpPu7E92uBKYQbLWv6ioghSDehJr1PL7fDvhC6CK");
    let program = new anchor.Program(IDL, programId, provider);

    it("Init discount", async () => {

        const discountId = PublicKey.findProgramAddressSync(
            [
              utils.bytes.utf8.encode("discount-prefix"),
              utils.bytes.utf8.encode(discountIdentifier),
            ],
            programId
          )[0];

        const tx = new Transaction();
        const ix = await program.methods
            .initDiscount({
                discountStr: 'test',
                authority: provider.wallet.publicKey,
                identifier: discountIdentifier
            })
            .accounts({
                discountData: discountId,
                payer: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .instruction();
        tx.add(ix);
        console.log(ix)
        await executeTransaction(provider.connection, tx, provider.wallet);

        
    });

})