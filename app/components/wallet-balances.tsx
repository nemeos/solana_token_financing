'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { connection, fetchWalletBalances, USDC_PUBKEY, MINT_PUBKEY } from '../anchor/setup'

export function WalletBalances() {
  const { publicKey } = useWallet()
  // TODO: Use the connection from the wallet adapter
  // const { connection } = useConnection()
  const [walletBalances, setWalletBalances] = useState<Awaited<ReturnType<typeof fetchWalletBalances>> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function readWalletBalances() {
    setIsLoading(true)
    try {
      const balances = await fetchWalletBalances(publicKey!, connection)
      setWalletBalances(balances)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!publicKey) return

    // Fetch initial wallet balances
    readWalletBalances()

    const publicKeyUsdc = getAssociatedTokenAddressSync(USDC_PUBKEY, publicKey, false, TOKEN_PROGRAM_ID)
    const publicKeyMintToken = getAssociatedTokenAddressSync(MINT_PUBKEY, publicKey, false, TOKEN_PROGRAM_ID)

    // Subscribe to wallet SOL, USDC and MINT token account changes
    const subscriptionId1 = connection.onAccountChange(publicKey, accountInfo => {
      console.log('Wallet balances subscription triggered for SOL')
      readWalletBalances()
    })
    const subscriptionId2 = connection.onAccountChange(publicKeyUsdc, accountInfo => {
      console.log('Wallet balances subscription triggered for USDC')
      readWalletBalances()
    })
    const subscriptionId3 = connection.onAccountChange(publicKeyMintToken, accountInfo => {
      console.log('Wallet balances subscription triggered for MINT')
      readWalletBalances()
    })

    return () => {
      // Unsubscribe from account change
      connection.removeAccountChangeListener(subscriptionId1)
      connection.removeAccountChangeListener(subscriptionId2)
      connection.removeAccountChangeListener(subscriptionId3)
    }
  }, [publicKey])

  return (
    <div className="text-lg">
      <h3 className="text-xl mb-2 mt-4">Wallet Balances</h3>

      {!publicKey ? (
        <p>Wallet not connected</p>
      ) : isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>{walletBalances!.balanceSolDisplayString} SOL</p>
          <p>{walletBalances!.balanceUsdcDisplayString} USDC</p>
          <p>{walletBalances!.balanceMintTokenDisplayString} MINT</p>
        </>
      )}
    </div>
  )
}
