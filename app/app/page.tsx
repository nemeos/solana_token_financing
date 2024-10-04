import { VaultState } from '../components/vault-state'
import { BuyWithNemeosButton } from '../components/buy-with-nemeos-button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <VaultState />
      <BuyWithNemeosButton />
    </div>
  )
}
