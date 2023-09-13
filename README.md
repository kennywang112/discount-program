# Cardinal rewards-center

[![License](https://img.shields.io/badge/license-AGPL%203.0-blue)](https://github.com/cardinal-labs/cardinal-rewards-center/blob/master/LICENSE)
[![Release](https://github.com/cardinal-labs/cardinal-rewards-center/actions/workflows/release.yml/badge.svg?branch=v0.0.27)](https://github.com/cardinal-labs/cardinal-rewards-center/actions/workflows/release.yml)

<div style="text-align: center; width: 100%;">
  <img style="width: 100%" src="./doc-assets/banner.png" />
</div>

<p align="center">
    A rewards center for NFTs and FTs on Solana
</p>

# Background

Cardinal rewards center is a modular smart contract for staking tokens and distributing various rewards.

# Getting Started

While the deployments of this program are not live, you can deploy your own by using these steps. This will first clone the repo then run `make keys` will generate a new keypair for your program and update authority. NOTE: You must not lose these keypairs. Substitute your own keypair in if you would like to use your own.

> Note: You must not lose the keypairs! They will be saved in ./keypairs directory. To use your own keypairs place them there and skip the `make keys` step

```bash
git clone https://github.com/cardinal-labs/cardinal-rewards-center.git
make keys
make key-replace
make install
make build
solana airdrop 2 --url devnet keypairs/update-authority.json
solana program deploy --url devnet --keypair ./keypairs/update-authority.json --program-id ./keypairs/program-id.json ./target/deploy/cardinal_rewards_center.so
```

# Packages

| Package                    | Description                              | Version                                                                                                                     | Docs                                                                                                                |
| :------------------------- | :--------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `cardinal-rewards-center`  | Stake pool tracking total stake duration | [![Crates.io](https://img.shields.io/crates/v/cardinal-rewards-center)](https://crates.io/crates/cardinal-rewards-center)   | [![Docs.rs](https://docs.rs/cardinal-rewards-center/badge.svg)](https://docs.rs/cardinal-rewards-center)            |
| `@cardinal/rewards-center` | TypeScript SDK for rewards-center        | [![npm](https://img.shields.io/npm/v/@cardinal/rewards-center.svg)](https://www.npmjs.com/package/@cardinal/rewards-center) | [![Docs](https://img.shields.io/badge/docs-typedoc-blue)](https://cardinal-labs.github.io/cardinal-rewards-center/) |

# State map

<div style="text-align: center; width: 100%;">
  <img style="width: 100%" src="./doc-assets/diagram.png" />
</div>
