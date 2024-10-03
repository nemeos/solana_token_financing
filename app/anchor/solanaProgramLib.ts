import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { SignerWalletAdapterProps } from '@solana/wallet-adapter-base'
import { BN } from 'bn.js'
import {
  configureAndSendTransaction,
  getNemeosUsdcAccount,
  getUserTokenAccountOrGetCreationTransactionInstruction,
  program2,
  USDC_PUBKEY,
} from './setup'

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
      await configureAndSendTransaction(
        new Transaction().add(borrowerUsdcPaymentAccountResult.createAssociatedTokenAccountInstruction!),
        connection,
        publicKey,
        signTransaction
      )
    }

    const borrowerUsdcPaymentAccount = borrowerUsdcPaymentAccountResult.associatedTokenAddress
    const nemeosUsdcAccount = await getNemeosUsdcAccount()

    console.log('[CreateLoan] *** Create loan ***')
    console.log({
      borrower: publicKey,
      nemeosPaymentAccount: nemeosUsdcAccount,
      borrowerPaymentAccount: borrowerUsdcPaymentAccount,
      mint: mintKey,
    })
    const transaction = new Transaction().add(
      await program2.methods
        .createLoan(new BN(2), new BN(0), new BN(2))
        .accounts({
          borrower: publicKey,
          nemeosPaymentAccount: nemeosUsdcAccount,
          borrowerPaymentAccount: borrowerUsdcPaymentAccount,
          mint: mintKey,
        })
        .instruction()
    )
    const transactionSignature = await configureAndSendTransaction(transaction, connection, publicKey, signTransaction)
    console.log('[CreateLoan] Success! transactionSignature', transactionSignature)

    return transactionSignature
  } catch (error) {
    console.error('[CreateLoan] Failed to call createLoan program method', error)
  }
}
