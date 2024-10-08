import { NextResponse } from 'next/server'
import { Keypair, PublicKey } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { connection, USDC_TOKEN_DECIMALS } from '../../../anchor/setup'

const USDC_PUBKEY = new PublicKey('HE5fcroCAV51ANSChXaSNkqYrkNP3kkXFJW7S1B2Uq8w')
const adminKeypair = Keypair.fromSecretKey(
  new Uint8Array([
    227, 136, 41, 186, 120, 160, 105, 75, 146, 4, 212, 155, 166, 21, 19, 61, 201, 241, 48, 104, 167, 149, 253, 185, 200, 101, 186, 219, 140,
    47, 243, 196, 1, 76, 78, 35, 34, 117, 130, 24, 247, 81, 114, 128, 170, 144, 225, 199, 121, 115, 181, 181, 236, 77, 39, 210, 230, 218, 6,
    21, 120, 40, 111, 252,
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
