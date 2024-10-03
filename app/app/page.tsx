import CounterState from '../components/counter-state'
import IncrementButton from '../components/increment-button'
import BuyWithNemeosButton from '../components/buy-with-nemeos-button'
import SolanaPay from '../components/solana-pay'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <CounterState />
      {/* <IncrementButton /> */}
      <BuyWithNemeosButton />
      <SolanaPay />
    </div>
  )
}
