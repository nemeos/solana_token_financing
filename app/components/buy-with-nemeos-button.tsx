'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@nextui-org/react'
import toast, { Toaster } from 'react-hot-toast'
import { connection2, MINT_PUBKEY } from '../anchor/setup'
import { createLoan } from '../anchor/solanaProgramLib'

export default function BuyWithNemeosButton() {
  const { publicKey, signTransaction } = useWallet()
  // const { connection } = useConnection()
  const connection = connection2 // TODO: Use the connection from the wallet adapter
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
