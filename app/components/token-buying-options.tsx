'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@nextui-org/react'
import toast, { Toaster } from 'react-hot-toast'
import { connection, MINT_PUBKEY, USDC_TOKEN_DECIMALS } from '../anchor/setup'
import { createLoan } from '../anchor/solanaProgramLib'
import { LOAN_LOTS, LoanLot, TOAST_OPTIONS } from '../app/constants'

function TokenBuyingOptionButton({
  loanLot,
  onclick,
  isLoading,
  isDisabled,
}: {
  loanLot: LoanLot
  onclick: () => Promise<void>
  isLoading: boolean
  isDisabled: boolean
}) {
  const fullPriceUsdcDisplayString = loanLot.token_quantity * (loanLot.token_price * 10 ** USDC_TOKEN_DECIMALS)
  const priceUsdcPerTokenDisplayString = loanLot.token_price * 10 ** USDC_TOKEN_DECIMALS
  return (
    <>
      <Button className="w-24" onClick={onclick} isLoading={isLoading} isDisabled={isDisabled}>
        <div className="m-4 p-4 rounded">
          <div>
            Buy {loanLot.token_quantity} MINT for {fullPriceUsdcDisplayString} USDC
          </div>
          <div>(1 MINT = {priceUsdcPerTokenDisplayString} USDC)</div>
        </div>
      </Button>
    </>
  )
}

export function TokenBuyingOptions() {
  const { publicKey, signTransaction } = useWallet()
  // TODO: Use the connection from the wallet adapter
  // const { connection } = useConnection()
  const [isLoading, setIsLoading] = useState(false)

  const onClickCreateLoan = async () => {
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
      <div>
        {LOAN_LOTS.map((loanLot, loanLotIndex) => (
          <TokenBuyingOptionButton
            key={loanLotIndex}
            loanLot={loanLot}
            onclick={onClickCreateLoan}
            isLoading={isLoading}
            isDisabled={!publicKey}
          />
        ))}
      </div>
      <Toaster position="bottom-center" reverseOrder={false} />
    </>
  )
}
