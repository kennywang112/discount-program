import { emptyWallet } from "@cardinal/common";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { IDL } from "./idl/cardinal_rewards_center";
export const REWARDS_CENTER_IDL = IDL;
export const REWARDS_CENTER_ADDRESS = new PublicKey("42eeY5ZCBmax9UFhcRXujFwNVbSLrN6rPDQv89nkyWrj");
export const WRAPPED_SOL_PAYMENT_INFO = new PublicKey("382KXQfzC26jbFmLZBmKoZ6eRz53iwGfxXwoGyyyH8po");
export const SOL_PAYMENT_INFO = new PublicKey("HqiCY5NqfHfyhyjheQ4ENo5J2XSQBpeqhNoeESkDWBpU");
export const DEFAULT_PAYMENT_INFO = new PublicKey("SdFEeJxn7XxcnYEMNpnoMMSsTfmA1bHfiRdu6qra7zL");
export const rewardsCenterProgram = (connection, wallet, opts) => {
    return new Program(REWARDS_CENTER_IDL, REWARDS_CENTER_ADDRESS, new AnchorProvider(connection, wallet !== null && wallet !== void 0 ? wallet : emptyWallet(Keypair.generate().publicKey), opts !== null && opts !== void 0 ? opts : {}));
};
//# sourceMappingURL=constants.js.map