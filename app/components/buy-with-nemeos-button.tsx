'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  program2,
  MINT_PUBKEY,
  connection2,
  configureAndSendTransaction,
  getUserTokenAccountOrGetCreationTransactionInstruction,
  getNemeosUsdcAccount,
  USDC_PUBKEY,
} from '../anchor/setup'
import { Button } from '@nextui-org/react'
import toast, { Toaster } from 'react-hot-toast'
import { BN } from 'bn.js'
import { Transaction, TransactionInstruction } from '@solana/web3.js'

export default function BuyWithNemeosButton() {
  const { publicKey, signTransaction } = useWallet()
  // const { connection } = useConnection()
  const connection = connection2 // TODO: Use the connection from the wallet adapter
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    if (!publicKey || !signTransaction) return

    setIsLoading(true)

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

      console.log(`*** Create loan ***`)
      console.log({
        borrower: publicKey,
        nemeosPaymentAccount: nemeosUsdcAccount,
        borrowerPaymentAccount: borrowerUsdcPaymentAccount,
        mint: MINT_PUBKEY,
      })
      const transaction = new Transaction().add(
        await program2.methods
          .createLoan(new BN(2), new BN(0), new BN(2))
          .accounts({
            borrower: publicKey,
            nemeosPaymentAccount: nemeosUsdcAccount,
            borrowerPaymentAccount: borrowerUsdcPaymentAccount,
            mint: MINT_PUBKEY,
          })
          .instruction()
      )
      const transactionSignature = await configureAndSendTransaction(transaction, connection, publicKey, signTransaction)
      console.log('transactionSignature', transactionSignature)

      toast.success(
        <a href={`https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`} target="_blank">
          View on SolanaFM
        </a>,
        {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }
      )
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button className="w-24" onClick={onClick} isLoading={isLoading} isDisabled={!publicKey}>
        {isLoading ? '' : 'Buy'}
      </Button>
      <Toaster position="bottom-center" reverseOrder={false} />
    </>
  )
}
