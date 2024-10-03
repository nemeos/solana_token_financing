# Nemeos Solana Token Financing

## Installation

Install Rust, Solana CLI, and Anchor CLI.

See Solana [Installation instructions](https://solana.com/docs/intro/installation).

```bash
$ solana --version
solana-cli 1.18.24 (src:7ba2a0e9; feat:3241752014, client:Agave)

$ anchor --version
anchor-cli 0.30.1
```

## Build project

```bash
anchor build
```

## Run tests

You need Solana accounts to run the tests. If you don't have them already, create them

```bash
solana-keygen new --outfile accounts/nemeos.json
solana-keygen new --outfile accounts/usdc.json
solana-keygen new --outfile accounts/admin.json
solana-keygen new --outfile accounts/seller.json
solana-keygen new --outfile accounts/borrower.json
```

Then run the tests

```bash
anchor test
```

## Manual tests

Configure Phantom browser extension to connect to Localnet at http://localhost:8899

Import the test wallet with the following mnemonic

```
claw blame sorry warrior true uphold hurt smooth express leopard hope fiction
```

In [`./tests/solana_token_financing.ts`](./tests/solana_token_financing.ts), uncomment the section around this line

```bash
console.log(`*** Waiting 24 hours (keeping cluster open) ***`);
```

Start and initialize a cluster and the program

```bash
anchor test
```

You can now play around with the project, the unit test will fund the test account with SOL and USDC.

### Start a local Solana cluster

```bash
solana-test-validator
```

## Common issues

### DeclaredProgramIdMismatch

If you see the following error

```bash
Error: AnchorError occurred. Error Code: DeclaredProgramIdMismatch. Error Number: 4100. Error Message: The declared program id does not match the actual program id.
```

Run the following command

```bash
anchor keys sync
```
