'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import toast, { Toaster } from 'react-hot-toast'
import { MINT_PUBKEY } from '../anchor/setup'
import { fetchLoanAccountData } from '../anchor/solanaProgramLib'
import { TOAST_OPTIONS } from '../app/constants'
import { TokenBuyingOptions } from './token-buying-options'
import { PayLoanStepButton } from './payLoanStep-button'

export function BuyWithNemeos() {
  const { publicKey } = useWallet()
  // TODO: Use the connection from the wallet adapter
  // const { connection } = useConnection()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loanAccountData, setLoanAccountData] = useState<Awaited<ReturnType<typeof fetchLoanAccountData>> | null>(null)

  useEffect(() => {
    readLoanAccountData()
  }, [publicKey])

  async function readLoanAccountData() {
    if (!publicKey) return

    setIsLoading(true)

    try {
      const loanAccountData_ = await fetchLoanAccountData(publicKey, MINT_PUBKEY)
      console.log('[FetchLoan] Loan account data', loanAccountData_)
      setLoanAccountData(loanAccountData_)
    } catch (error: any) {
      console.error('[FetchLoan] Failed to fetch loan account data', error)
      toast.error(`Failed to fetch wallet loan account data: ${error.name}`, TOAST_OPTIONS)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {!loanAccountData ? (
            <div>
              {/* TODO: Show buying options */}
              Buy!
              <TokenBuyingOptions />
            </div>
          ) : (
            <div>
              Current loan:
              <pre>{JSON.stringify(loanAccountData, null, 2)}</pre>
              Pay next loan step:
              <PayLoanStepButton loanAccountData={loanAccountData} />
            </div>
          )}
        </div>
      )}
      <Toaster position="bottom-right" reverseOrder={false} />
    </>
  )
}
