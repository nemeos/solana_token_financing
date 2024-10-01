import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js'
import { IdlAccounts, Program } from '@coral-xyz/anchor'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

import idl from './idl.json'
import type { Counter } from './idlType'

import idl2 from './solana_token_financing.json'
import type { SolanaTokenFinancing } from './solana_token_financing'
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token'

const connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet), 'confirmed')

const connection2 = new Connection(
  // clusterApiUrl(WalletAdapterNetwork.Devnet)
  'http://localhost:8899',
  'confirmed'
)

export const program = new Program(idl as Counter, {
  connection,
})

export const [mintPDA] = PublicKey.findProgramAddressSync([Buffer.from('mint')], program.programId)
export const [counterPDA] = PublicKey.findProgramAddressSync([Buffer.from('counter')], program.programId)

export type CounterData = IdlAccounts<Counter>['counter']

// ---------------------------------------------------------------------------------------------

export const program2 = new Program(idl2 as SolanaTokenFinancing, {
  connection: connection2,
})

// // Loan Account PDA
// export const [loanAccountPDA] = PublicKey.findProgramAddressSync([Buffer.from('nemeos_loan_account')], program2.programId)

// // Vault Account PDA
// export const [vaultAccountPDA] = PublicKey.findProgramAddressSync([Buffer.from('nemeos_vault_account')], program2.programId)

// // Token Account Owner PDA
// export const [tokenAccountOwnerPDA] = PublicKey.findProgramAddressSync([Buffer.from('token_account_owner_pda')], program2.programId)

// // Vault Token Account PDA
// export const [vaultTokenAccountPDA] = PublicKey.findProgramAddressSync([Buffer.from('nemeos_vault_token_account')], program2.programId)

// // Borrower Token Account PDA
// export const [borrowerTokenAccountPDA] = PublicKey.findProgramAddressSync(
//   [Buffer.from('nemeos_borrower_token_account')],
//   program2.programId
// )

// // Loan Account PDA for Upfront Payment or Repayment
// export const [loanAccountForPaymentPDA] = PublicKey.findProgramAddressSync([Buffer.from('nemeos_loan_account')], program2.programId)

export type TokenAccountOwnerPdaData = IdlAccounts<SolanaTokenFinancing>['tokenAccountOwnerPda']
export type VaultAccountData = IdlAccounts<SolanaTokenFinancing>['vaultAccount']
export type LoanAccountData = IdlAccounts<SolanaTokenFinancing>['loanAccount']

const TOKEN_DECIMALS: number = 2
const USDC_TOKEN_DECIMALS: number = 6

const NEMEOS_PUBKEY = new PublicKey('9WnKTizjgyntHrGUuZScLt4hWjqmqmNHzpxQxpsTDvLV')
const USDC_PUBKEY = new PublicKey('6zoLyaNoXjBGg68feJv1NKWTacdD6miQsHwzLtue6TfS')
const MINT_PUBKEY = new PublicKey('3KXubyatkczxdM7CkWPUcYfHmXYpG5CYEdnfbUWMaEMM')

let [vaultAccount] = PublicKey.findProgramAddressSync([Buffer.from('nemeos_vault_account'), MINT_PUBKEY.toBuffer()], program2.programId)

function getNemeosUsdcAccount() {
  return getAssociatedTokenAddress(
    USDC_PUBKEY,
    NEMEOS_PUBKEY,
    false, // Do not create the token account if it does not exist
    TOKEN_PROGRAM_ID
  )
}

// Check we can fetch the account from Solana program
program2.account.vaultAccount.fetch(vaultAccount).then(data => {
  console.log('vaultAccount', data)
})
