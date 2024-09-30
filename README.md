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

You need a Solana account to run the tests. If you don't have one already, create one:

```bash
solana-keygen new --outfile accounts/id.json
```

Then run the tests:

```bash
anchor test
```

## Utility scripts

### Start a local Solana cluster

```bash
solana-test-validator
```

## Common issues

### DeclaredProgramIdMismatch

If you see the following error:

```bash
Error: AnchorError occurred. Error Code: DeclaredProgramIdMismatch. Error Number: 4100. Error Message: The declared program id does not match the actual program id.
```

Run the following command:

```bash
anchor keys sync
```
