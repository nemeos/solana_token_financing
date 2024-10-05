import { VaultState } from '../components/vault-state'
import { WalletBalances } from '../components/wallet-balances'
import { BuyWithNemeos } from '../components/buy-with-nemeos'
import { Divider } from '@nextui-org/react'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="w-1/2">
        <VaultState />
        <WalletBalances />
        <Divider className="my-4" />
        <BuyWithNemeos />
      </div>
    </div>
  )
}
