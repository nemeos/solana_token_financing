'use client'

import { useEffect, useState } from 'react'
import { vaultAccountPDA, VaultAccountData, connection, program, MINT_TOKEN_DECIMALS } from '../anchor/setup'
import { fetchVaultAccountData } from '../anchor/solanaProgramLib'

export function VaultState() {
  // TODO: Use the connection from the wallet adapter
  // const { connection } = useConnection()
  const [vaultAccountData, setVaultAccountData] = useState<VaultAccountData | null>(null)

  useEffect(() => {
    // Fetch initial account data
    fetchVaultAccountData().then(data => {
      setVaultAccountData(data)
    })

    // Subscribe to account change
    const subscriptionId = connection.onAccountChange(vaultAccountPDA, accountInfo => {
      console.log('Vault state subscription triggered')
      setVaultAccountData(program.coder.accounts.decode('nemeos_vault_account', accountInfo.data))
    })

    return () => {
      // Unsubscribe from account change
      connection.removeAccountChangeListener(subscriptionId)
    }
  }, [program])

  return (
    <div className="text-lg">
      <h3>Vault State</h3>
      <p>Available Tokens: {(vaultAccountData?.availableTokens.toNumber() || -1) / 10 ** MINT_TOKEN_DECIMALS} MINT</p>
      <p>Annual Interest Rate: {vaultAccountData?.annualInterestRate}%</p>
    </div>
  )
}
