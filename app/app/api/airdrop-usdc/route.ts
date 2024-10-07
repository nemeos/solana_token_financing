import { NextResponse } from 'next/server'
import { Keypair, PublicKey } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { connection, USDC_TOKEN_DECIMALS } from '../../../anchor/setup'

const USDC_PUBKEY = new PublicKey('6zoLyaNoXjBGg68feJv1NKWTacdD6miQsHwzLtue6TfS')
const adminKeypair = Keypair.fromSecretKey(
  new Uint8Array([
    119, 116, 86, 157, 172, 224, 88, 90, 91, 159, 5, 156, 159, 37, 145, 82, 53, 143, 37, 162, 110, 177, 254, 238, 121, 122, 28, 161, 185,
    210, 7, 5, 138, 37, 85, 29, 197, 106, 90, 148, 199, 252, 8, 29, 150, 115, 53, 60, 223, 7, 40, 249, 45, 232, 173, 132, 10, 64, 147, 118,
    119, 6, 233, 208,
  ])
)

export async function POST(req: Request) {
  try {
    const { publicKey } = await req.json()

    if (!publicKey) {
      return NextResponse.json({ error: 'Public key is required' }, { status: 400 })
    }

    const borrowerPublicKey = new PublicKey(publicKey)

    const borrowerPaymentAccount = await getOrCreateAssociatedTokenAccount(connection, adminKeypair, USDC_PUBKEY, borrowerPublicKey)

    await mintTo(
      connection,
      adminKeypair,
      USDC_PUBKEY,
      borrowerPaymentAccount.address,
      adminKeypair.publicKey,
      1_000 * 10 ** USDC_TOKEN_DECIMALS
    )

    return NextResponse.json({ message: 'USDC Airdrop sent', publicKey })
  } catch (error: any) {
    return NextResponse.json({ error: 'An error occurred', message: error.message }, { status: 500 })
  }
}
