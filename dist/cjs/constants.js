"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewardsCenterProgram = exports.DEFAULT_PAYMENT_INFO = exports.SOL_PAYMENT_INFO = exports.WRAPPED_SOL_PAYMENT_INFO = exports.REWARDS_CENTER_ADDRESS = exports.REWARDS_CENTER_IDL = void 0;
const common_1 = require("@cardinal/common");
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const cardinal_rewards_center_1 = require("./idl/cardinal_rewards_center");
exports.REWARDS_CENTER_IDL = cardinal_rewards_center_1.IDL;
exports.REWARDS_CENTER_ADDRESS = new web3_js_1.PublicKey("42eeY5ZCBmax9UFhcRXujFwNVbSLrN6rPDQv89nkyWrj");
exports.WRAPPED_SOL_PAYMENT_INFO = new web3_js_1.PublicKey("382KXQfzC26jbFmLZBmKoZ6eRz53iwGfxXwoGyyyH8po");
exports.SOL_PAYMENT_INFO = new web3_js_1.PublicKey("HqiCY5NqfHfyhyjheQ4ENo5J2XSQBpeqhNoeESkDWBpU");
exports.DEFAULT_PAYMENT_INFO = new web3_js_1.PublicKey("SdFEeJxn7XxcnYEMNpnoMMSsTfmA1bHfiRdu6qra7zL");
const rewardsCenterProgram = (connection, wallet, opts) => {
    return new anchor_1.Program(exports.REWARDS_CENTER_IDL, exports.REWARDS_CENTER_ADDRESS, new anchor_1.AnchorProvider(connection, wallet !== null && wallet !== void 0 ? wallet : (0, common_1.emptyWallet)(web3_js_1.Keypair.generate().publicKey), opts !== null && opts !== void 0 ? opts : {}));
};
exports.rewardsCenterProgram = rewardsCenterProgram;
//# sourceMappingURL=constants.js.map