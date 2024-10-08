import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { SignerWalletAdapterProps } from '@solana/wallet-adapter-base'
import { BN } from 'bn.js'
import {
  configureAndSendTransaction,
  connection,
  fetchAccountTokenAmount,
  fetchWalletBalances,
  getNemeosUsdcAccount,
  getUserTokenAccountOrGetCreationTransactionInstruction,
  MINT_PUBKEY,
  program,
  USDC_PUBKEY,
  vaultAccountPDA,
} from './setup'
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token'

export function fetchVaultAccountData() {
  return program.account.vaultAccount.fetch(vaultAccountPDA)
}

export async function createLoan(
  selectedLoanLotIndex: number,
  selectedLoanTypeIndex: number,
  publicKey: PublicKey,
  mintKey: PublicKey,
  connection: Connection,
  signTransaction: SignerWalletAdapterProps['signTransaction']
) {
  try {
    const borrowerUsdcPaymentAccountResult = await getUserTokenAccountOrGetCreationTransactionInstruction(
      publicKey,
      USDC_PUBKEY,
      connection
    )
    if (!borrowerUsdcPaymentAccountResult.alreadyExists) {
      // No USDC account yet, create it
      await configureAndSendTransaction(
        new Transaction().add(borrowerUsdcPaymentAccountResult.createAssociatedTokenAccountInstruction!),
        connection,
        publicKey,
        signTransaction
      )
    }

    const borrowerUsdcPaymentAccount = borrowerUsdcPaymentAccountResult.associatedTokenAddress
    const nemeosUsdcAccount = await getNemeosUsdcAccount()
    const vaultAccountData = await fetchVaultAccountData()
    const sellerUsdcAccount = await getAssociatedTokenAddress(USDC_PUBKEY, vaultAccountData.seller, false, TOKEN_PROGRAM_ID)

    console.log('[CreateLoan] *** Create loan and pay upfront payment ***')
    console.log({
      selectedLoanLotIndex,
      selectedLoanTypeIndex,
      borrower: publicKey,
      nemeosPaymentAccount: nemeosUsdcAccount,
      borrowerPaymentAccount: borrowerUsdcPaymentAccount,
      mint: mintKey,
      sellerPaymentAccount: sellerUsdcAccount,
    })
    // Bundle createLoan and upfrontPayment
    const transaction = new Transaction()
      .add(
        await program.methods
          // @ts-ignore
          .createLoan(new BN(1), new BN(selectedLoanLotIndex), new BN(selectedLoanTypeIndex))
          .accounts({
            borrower: publicKey,
            nemeosPaymentAccount: nemeosUsdcAccount,
            borrowerPaymentAccount: borrowerUsdcPaymentAccount,
            mint: mintKey,
          })
          .instruction()
      )
      .add(
        await program.methods
          .upfrontPayment()
          .accounts({
            borrower: publicKey,
            sellerPaymentAccount: sellerUsdcAccount,
            borrowerPaymentAccount: borrowerUsdcPaymentAccount,
            mint: mintKey,
          })
          .instruction()
      )
    const transactionSignature = await configureAndSendTransaction(transaction, connection, publicKey, signTransaction)
    console.log('[CreateLoan] Success! transactionSignature', transactionSignature)

    return transactionSignature
  } catch (error) {
    console.error('[CreateLoan] Calling program method failed!', error)
    throw error
  }
}

export async function payLoanStep(
  publicKey: PublicKey,
  mintKey: PublicKey,
  connection: Connection,
  signTransaction: SignerWalletAdapterProps['signTransaction'],
  isLastLoanStep = false
) {
  try {
    const borrowerUsdcPaymentAccountResult = await getUserTokenAccountOrGetCreationTransactionInstruction(
      publicKey,
      USDC_PUBKEY,
      connection
    )
    if (!borrowerUsdcPaymentAccountResult.alreadyExists) {
      // No USDC account yet, create it (should likely never happen except if they closed their USDC account)
      await configureAndSendTransaction(
        new Transaction().add(borrowerUsdcPaymentAccountResult.createAssociatedTokenAccountInstruction!),
        connection,
        publicKey,
        signTransaction
      )
    }

    const borrowerUsdcPaymentAccount = borrowerUsdcPaymentAccountResult.associatedTokenAddress
    const vaultAccountData = await fetchVaultAccountData()
    const sellerUsdcAccount = await getAssociatedTokenAddress(USDC_PUBKEY, vaultAccountData.seller, false, TOKEN_PROGRAM_ID)

    console.log(isLastLoanStep ? '[Payment] *** Pay last loan step and close loan ***' : '[Payment] *** Pay loan step ***')
    console.log({
      borrower: publicKey,
      sellerPaymentAccount: sellerUsdcAccount,
      borrowerPaymentAccount: borrowerUsdcPaymentAccount,
      mint: mintKey,
    })
    const transaction = new Transaction()
    transaction.add(
      await program.methods
        .payment()
        .accounts({
          borrower: publicKey,
          sellerPaymentAccount: sellerUsdcAccount,
          borrowerPaymentAccount: borrowerUsdcPaymentAccount,
          mint: mintKey,
        })
        .instruction()
    )
    if (isLastLoanStep) {
      transaction.add(
        await program.methods
          .closeLoan()
          .accounts({
            // @ts-ignore
            borrower: publicKey,
            mint: mintKey,
          })
          .instruction()
      )
    }
    const transactionSignature = await configureAndSendTransaction(transaction, connection, publicKey, signTransaction)
    console.log('[Payment] Success! transactionSignature', transactionSignature)

    return transactionSignature
  } catch (error) {
    console.error('[Payment] Calling program method failed!', error)
    throw error
  }
}

export async function fetchLoanAccountData(publicKey: PublicKey, mintKey: PublicKey) {
  const [loanAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from('nemeos_loan_account'), mintKey.toBuffer(), publicKey.toBuffer()],
    program.programId
  )
  return program.account.loanAccount.fetch(loanAccount)
}
