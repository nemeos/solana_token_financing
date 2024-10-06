'use client'

import { useEffect, useState } from 'react'
import { vaultAccountPDA, VaultAccountData, connection, program, MINT_TOKEN_DECIMALS, USDC_PUBKEY } from '../anchor/setup'
import { fetchVaultAccountData } from '../anchor/solanaProgramLib'
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token'

export function VaultState() {
  // TODO: Use the connection from the wallet adapter
  // const { connection } = useConnection()
  const [vaultAccountData, setVaultAccountData] = useState<VaultAccountData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch initial account data
    fetchVaultAccountData()
      .then(async vaultAccountData => {
        setVaultAccountData(vaultAccountData)

        const sellerUsdcAccount = await getAssociatedTokenAddress(USDC_PUBKEY, vaultAccountData.seller, false, TOKEN_PROGRAM_ID)

        // Subscribe to account change on vault account SOL and seller USDC account
        connection.onAccountChange(vaultAccountPDA, accountInfo => {
          console.log('Vault state subscription triggered on vaultAccountPDA')
          setVaultAccountData(program.coder.accounts.decode('nemeos_vault_account', accountInfo.data))
        })
        connection.onAccountChange(sellerUsdcAccount, async _accountInfo => {
          console.log('Vault2 state subscription triggered on sellerUsdcAccount')
          const vaultAccountData = await fetchVaultAccountData()
          setVaultAccountData(vaultAccountData)
        })
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="text-lg">
      <h3 className="text-xl mb-2 mt-4">Vault State</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {vaultAccountData ? (
            <p>Available For Purchase: {vaultAccountData.availableTokens.toNumber() / 10 ** MINT_TOKEN_DECIMALS} MINT</p>
          ) : (
            <p>Vault account not initialized.</p>
          )}
        </div>
      )}
    </div>
  )
}
