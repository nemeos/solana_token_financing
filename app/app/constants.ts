import { ToastOptions } from 'react-hot-toast'

export const TOAST_OPTIONS: ToastOptions = {
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
  },
  position: 'bottom-right',
  duration: 10_000,
}

export type LoanLot = {
  token_quantity: number
  token_price: number
}
export const LOAN_LOTS: LoanLot[] = [
  {
    token_quantity: 100,
    token_price: 1_000_000, // 1 USDC
  },
  {
    token_quantity: 1000,
    token_price: 900_000, // 0.9 USDC
  },
]

export type LoanType = {
  period_duration_in_seconds: number
  nb_of_payments: number // including upfront
  upfront: number // upfront except fees
  annual_interest_rate: number
}
export const LOANS_TYPES: LoanType[] = [
  {
    period_duration_in_seconds: 60 * 60 * 24 * 14, // payment every two weeks
    nb_of_payments: 4, // including upfront
    upfront: 25, // upfront except fees
    annual_interest_rate: 20,
  },
  {
    period_duration_in_seconds: 60 * 60 * 24 * 30, // payment every 30 days
    nb_of_payments: 11, // including upfront
    upfront: 20, // upfront except fees
    annual_interest_rate: 10,
  },
  {
    period_duration_in_seconds: 3, // payment every 3s (for testing only)
    nb_of_payments: 4, // including upfront
    upfront: 25, // upfront except fees
    annual_interest_rate: 20,
  },
]
