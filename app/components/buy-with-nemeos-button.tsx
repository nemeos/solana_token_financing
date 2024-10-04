'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@nextui-org/react'
import toast, { Toaster } from 'react-hot-toast'
import { connection, MINT_PUBKEY } from '../anchor/setup'
import { createLoan } from '../anchor/solanaProgramLib'
import { TOAST_OPTIONS } from '../app/constants'

export function BuyWithNemeosButton() {
  const { publicKey, signTransaction } = useWallet()
  // TODO: Use the connection from the wallet adapter
  // const { connection } = useConnection()
  const [isLoading, setIsLoading] = useState(false)

  const onClick = async () => {
    if (!publicKey || !signTransaction) return

    setIsLoading(true)

    try {
      const transactionSignature = await createLoan(publicKey, MINT_PUBKEY, connection, signTransaction)
      console.log('transactionSignature', transactionSignature)

      toast.success(
        <a href={`https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`} target="_blank">
          View on SolanaFM
        </a>,
        TOAST_OPTIONS
      )
    } catch (error: any) {
      toast.error(`Failed to purchase: ${error.name}`, TOAST_OPTIONS)
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
