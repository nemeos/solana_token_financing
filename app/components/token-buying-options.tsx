'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button, RadioGroup, useRadio, VisuallyHidden, cn } from '@nextui-org/react'
import toast, { Toaster } from 'react-hot-toast'
import { connection, MINT_PUBKEY, USDC_TOKEN_DECIMALS } from '../anchor/setup'
import { createLoan } from '../anchor/solanaProgramLib'
import { LOAN_LOTS, LOANS_TYPES, TOAST_OPTIONS } from '../app/constants'

export const CustomRadio = (props: any) => {
  const {
    Component,
    children,
    isSelected,
    description,
    getBaseProps,
    getWrapperProps,
    getInputProps,
    getLabelProps,
    getLabelWrapperProps,
    getControlProps,
  } = useRadio(props)

  return (
    <Component
      {...getBaseProps()}
      className={cn(
        'group inline-flex items-center hover:opacity-70 active:opacity-50 justify-between flex-row-reverse tap-highlight-transparent',
        'max-w-[350px] cursor-pointer border-2 border-default rounded-lg gap-4 p-4',
        'data-[selected=true]:border-primary'
      )}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <span {...getWrapperProps()}>
        <span {...getControlProps()} />
      </span>
      <div {...getLabelWrapperProps()}>
        {children && <span {...getLabelProps()}>{children}</span>}
        {description && <span className="text-small text-foreground opacity-70">{description}</span>}
      </div>
    </Component>
  )
}

export function TokenBuyingOptions() {
  const { publicKey, signTransaction } = useWallet()
  // TODO: Use the connection from the wallet adapter
  // const { connection } = useConnection()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLoanLotIndex, setSelectedLoanLot] = useState<number>(0)
  const [selectedLoanTypeIndex, setSelectedLoanType] = useState<number>(0)

  const onClickCreateLoan = async () => {
    if (!publicKey || !signTransaction) return

    setIsLoading(true)

    try {
      const transactionSignature = await createLoan(
        selectedLoanLotIndex,
        selectedLoanTypeIndex,
        publicKey,
        MINT_PUBKEY,
        connection,
        signTransaction
      )
      console.log('transactionSignature', transactionSignature)

      toast.success(
        <a href={`https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`} target="_blank">
          View on SolanaFM
        </a>,
        TOAST_OPTIONS
      )
    } catch (error: any) {
      toast.error(`Failed to purchase: ${error.name}`, TOAST_OPTIONS)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div>
        <RadioGroup
          className="my-4"
          label="Amount of MINT to buy"
          value={selectedLoanLotIndex.toString()}
          onValueChange={value => setSelectedLoanLot(parseInt(value))}
        >
          {LOAN_LOTS.map((loanLot, loanLotIndex) => (
            <CustomRadio
              key={loanLot.token_quantity}
              description={`(1 MINT = ${loanLot.token_price / 10 ** USDC_TOKEN_DECIMALS} USDC)`}
              value={loanLotIndex.toString()}
            >
              Buy {loanLot.token_quantity} MINT for {loanLot.token_quantity * (loanLot.token_price / 10 ** USDC_TOKEN_DECIMALS)} USDC
            </CustomRadio>
          ))}
        </RadioGroup>

        <RadioGroup
          className="my-4"
          label="Type of loan"
          value={selectedLoanTypeIndex.toString()}
          onValueChange={value => setSelectedLoanType(parseInt(value))}
        >
          {LOANS_TYPES.map((loanType, loanTypeIndex) => (
            <CustomRadio
              key={loanType.period_duration_in_seconds}
              description={`(${loanType.nb_of_payments} payments, ${loanType.upfront}% upfront, ${loanType.annual_interest_rate}% APR)`}
              value={loanTypeIndex.toString()}
            >
              {loanType.ui_period_duration_display_string}
            </CustomRadio>
          ))}
        </RadioGroup>

        <Button onClick={onClickCreateLoan} isLoading={isLoading} isDisabled={!publicKey}>
          {publicKey ? 'Buy' : 'Wallet Not Connected'}
        </Button>
      </div>
      <Toaster position="bottom-center" reverseOrder={false} />
    </>
  )
}
