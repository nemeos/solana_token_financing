'use client'

import { useEffect, useState } from 'react'
import { Button } from '@nextui-org/react'
import { useWallet } from '@solana/wallet-adapter-react'
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import toast from 'react-hot-toast'
import { connection, fetchWalletBalances, USDC_PUBKEY, MINT_PUBKEY } from '../anchor/setup'
import { TOAST_OPTIONS } from '../app/constants'

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

  async function airdropUsdc() {
    if (!publicKey) return

    setIsLoading(true)
    try {
      const result = await fetch('/api/airdrop-usdc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicKey: publicKey.toBase58() }),
      })
      if (!result.ok) {
        const errorMessage = (await result.json())?.error
        const messageToShow = `Failed to airdrop USDC to wallet:${errorMessage}`
        console.error(messageToShow)
        toast.error(messageToShow, TOAST_OPTIONS)
      } else {
        toast.success('USDC Airdrop successful!', TOAST_OPTIONS)
        readWalletBalances()
      }
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
      <h3 className="text-xl mb-2 mt-4">Connected Wallet Balances</h3>

      {!publicKey ? (
        <p>Wallet not connected</p>
      ) : isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>{walletBalances!.balanceSolDisplayString} SOL</p>
          <p>{walletBalances!.balanceUsdcDisplayString} USDC</p>
          <p>{walletBalances!.balanceMintTokenDisplayString} MINT</p>
          <div>
            <Button className="mr-4 mt-2" as="a" href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer">
              Airdrop SOL to wallet
            </Button>
            <Button className="mr-4 mt-2" onClick={airdropUsdc} isDisabled={!publicKey}>
              {isLoading ? '' : 'Airdrop USDC to wallet'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
