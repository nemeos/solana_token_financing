import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { SignerWalletAdapterProps } from '@solana/wallet-adapter-base'
import { BN } from 'bn.js'
import {
  configureAndSendTransaction,
  getNemeosUsdcAccount,
  getUserTokenAccountOrGetCreationTransactionInstruction,
  program,
  USDC_PUBKEY,
  vaultAccountPDA,
} from './setup'

export function fetchVaultAccountData() {
  return program.account.vaultAccount.fetch(vaultAccountPDA)
}

export async function createLoan(
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

    console.log('[CreateLoan] *** Create loan and pay upfront payment ***')
    console.log({
      borrower: publicKey,
      nemeosPaymentAccount: nemeosUsdcAccount,
      borrowerPaymentAccount: borrowerUsdcPaymentAccount,
      mint: mintKey,
      sellerPaymentAccount: vaultAccountData.seller,
    })
    // Bundle createLoan and upfrontPayment
    const transaction = new Transaction()
      .add(
        await program.methods
          .createLoan(new BN(2), new BN(0), new BN(2))
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
            sellerPaymentAccount: vaultAccountData.seller,
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
  signTransaction: SignerWalletAdapterProps['signTransaction']
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

    console.log('[Payment] *** Pay loan step ***')
    console.log({
      borrower: publicKey,
      sellerPaymentAccount: vaultAccountData.seller,
      borrowerPaymentAccount: borrowerUsdcPaymentAccount,
      mint: mintKey,
    })
    const transaction = new Transaction().add(
      await program.methods
        .payment()
        .accounts({
          borrower: publicKey,
          sellerPaymentAccount: vaultAccountData.seller,
          borrowerPaymentAccount: borrowerUsdcPaymentAccount,
          mint: mintKey,
        })
        .instruction()
    )
    const transactionSignature = await configureAndSendTransaction(transaction, connection, publicKey, signTransaction)
    console.log('[Payment] Success! transactionSignature', transactionSignature)

    return transactionSignature
  } catch (error) {
    console.error('[Payment] Calling program method failed!', error)
    throw error
  }
}

export async function closeLoan(
  publicKey: PublicKey,
  mintKey: PublicKey,
  connection: Connection,
  signTransaction: SignerWalletAdapterProps['signTransaction']
) {
  try {
    console.log('[CloseLoan] *** Close loan ***')
    console.log({
      borrower: publicKey,
      mint: mintKey,
    })
    const transaction = new Transaction().add(
      await program.methods
        .closeLoan()
        .accounts({
          borrower: publicKey,
          mint: mintKey,
        })
        .instruction()
    )
    const transactionSignature = await configureAndSendTransaction(transaction, connection, publicKey, signTransaction)
    console.log('[CloseLoan] Success! transactionSignature', transactionSignature)

    return transactionSignature
  } catch (error) {
    console.error('[CloseLoan] Calling program method failed!', error)
    throw error
  }
}
