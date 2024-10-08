'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import toast, { Toaster } from 'react-hot-toast'
import { MINT_PUBKEY, MINT_TOKEN_DECIMALS, USDC_TOKEN_DECIMALS } from '../anchor/setup'
import { fetchLoanAccountData } from '../anchor/solanaProgramLib'
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
      console.log('[FetchLoan] Could not fetch loan account data (account maybe does not exist, this is not necessarly an error', error)
      setLoanAccountData(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="my-8">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {!loanAccountData ? (
            <div>
              <h2 className="text-2xl">Buy with Nemeos</h2>
              <TokenBuyingOptions readLoanAccountData={readLoanAccountData} />
            </div>
          ) : (
            <div>
              <h2 className="text-2xl">Pay my loan</h2>
              <div className="my-6">
                <div className="my-2">Number of Remaining Payments: {loanAccountData.nbRemainingPayments}</div>
                <div className="my-2">
                  To Pay Per instalment: {loanAccountData.paymentAmount.toNumber() / 10 ** USDC_TOKEN_DECIMALS} USDC
                </div>
                <div className="my-2">
                  To Receive Per Payment: {loanAccountData.nbOfTokensPerPayment.toNumber() / 10 ** MINT_TOKEN_DECIMALS} MINT
                </div>
                <div className="my-2">Period Duration: {loanAccountData.periodDurationInSeconds.toNumber() / 60 / 60 / 24} days</div>
                <div className="mt-4">
                  <PayLoanStepButton loanAccountData={loanAccountData} readLoanAccountData={readLoanAccountData} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  )
}
