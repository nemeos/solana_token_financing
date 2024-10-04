import { VaultState } from '../components/vault-state'
import { WalletBalances } from '../components/wallet-balances'
import { BuyWithNemeos } from '../components/buy-with-nemeos'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <VaultState />
      <WalletBalances />
      <BuyWithNemeos />
    </div>
  )
}
