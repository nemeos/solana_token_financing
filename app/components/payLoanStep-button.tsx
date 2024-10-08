'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@nextui-org/react'
import toast, { Toaster } from 'react-hot-toast'
import { connection, MINT_PUBKEY } from '../anchor/setup'
import { fetchLoanAccountData, payLoanStep } from '../anchor/solanaProgramLib'
import { TOAST_OPTIONS } from '../app/constants'
import { showConfettis } from '../utils'

export function PayLoanStepButton({
  loanAccountData,
  readLoanAccountData,
}: {
  loanAccountData: Awaited<ReturnType<typeof fetchLoanAccountData>>
  readLoanAccountData: () => void
}) {
  const { publicKey, signTransaction } = useWallet()
  // TODO: Use the connection from the wallet adapter
  // const { connection } = useConnection()
  const [isLoading, setIsLoading] = useState(false)

  const onClickPayLoanStep = async () => {
    if (!publicKey || !signTransaction) return

    setIsLoading(true)

    try {
      console.log('[Pay next loan step] loanAccountData', loanAccountData)
      const isLastLoanStep = loanAccountData.nbRemainingPayments === 1
      const transactionSignature = await payLoanStep(publicKey, MINT_PUBKEY, connection, signTransaction, isLastLoanStep)
      console.log('transactionSignature', transactionSignature)

      if (isLastLoanStep) showConfettis()
      toast.success(
        <p>
          {isLastLoanStep && (
            <>
              Your loan was completed! 🎉
              <br />
            </>
          )}
          <a href={`https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`} target="_blank">
            View on SolanaFM
          </a>
        </p>,
        TOAST_OPTIONS
      )
    } catch (error: any) {
      toast.error(`Failed to pay loan step: ${error.name}`, TOAST_OPTIONS)
    } finally {
      setIsLoading(false)
      readLoanAccountData()
    }
  }

  return (
    <>
      <Button onClick={onClickPayLoanStep} isLoading={isLoading} isDisabled={!publicKey}>
        {isLoading ? '' : 'Pay next loan step'}
      </Button>
      <Toaster position="bottom-center" reverseOrder={false} />
    </>
  )
}
