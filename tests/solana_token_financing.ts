import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {Connection, Keypair, PublicKey, LAMPORTS_PER_SOL} from '@solana/web3.js';
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    getAccount,
    transfer,
} from '@solana/spl-token';
import {SolanaTokenFinancing} from "../target/types/solana_token_financing";

describe("functional testing", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolanaTokenFinancing as Program<SolanaTokenFinancing>;
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

    it("Full workflow", async () => {
        // Create keypairs
        const nemeosKeypair = Keypair.generate();
        console.log('Nemeos address:', nemeosKeypair.publicKey.toBase58());
        const mintKeypair = Keypair.generate();
        console.log('Mint address:', mintKeypair.publicKey.toBase58());
        const buyerKeypair = Keypair.generate();
        console.log('Buyer address:', buyerKeypair.publicKey.toBase58());

        // Airdrops
        let txNemeosAirdrop = await connection.requestAirdrop(
            nemeosKeypair.publicKey,
            5 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(txNemeosAirdrop);
        let txMintAirdrop = await connection.requestAirdrop(
            mintKeypair.publicKey,
            5 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(txMintAirdrop);
        let txBuyerAirdrop = await connection.requestAirdrop(
            buyerKeypair.publicKey,
            100 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(txBuyerAirdrop);

        // Create a SPL token
        const mint = await createMint(
            connection,
            mintKeypair, // Payer
            mintKeypair.publicKey, // Mint authority
            null, // Freeze authority
            9, // Decimals
        );
        console.log('Mint address:', mint.toBase58());

        // Create an associated token account for Nemeos
        const nemeosTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            nemeosKeypair, // Payer
            mint, // SPL token address
            nemeosKeypair.publicKey // Owner of the token account
        );
        console.log('Nemeos token account:', nemeosTokenAccount.address.toBase58());

        // Mint tokens to the user's token account
        await mintTo(
            connection,
            mintKeypair, // Payer
            mint, // SPL token address
            nemeosTokenAccount.address, // Destination account
            mintKeypair.publicKey, // Mint authority
            1_000_000_000 // Amount of tokens to mint (1 token with 9 decimals)
        );

        // Check the balance of the user's token account
        const nemeosAccountInfo = await getAccount(connection, nemeosTokenAccount.address);
        console.log('Nemeos account balance:', Number(nemeosAccountInfo.amount) / 1_000_000_000);

        // Create a token account for the buyer
        const buyerTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            mintKeypair, // Payer
            mint, // SPL token address
            buyerKeypair.publicKey // Owner of the token account
        );
        console.log('Buyer token account:', buyerTokenAccount.address.toBase58());


        // Transfer tokens from Nemeos to the buyer
        await transfer(
            connection,
            nemeosKeypair, // Payer
            nemeosTokenAccount.address, // Source token account
            buyerTokenAccount.address, // Destination token account
            nemeosKeypair.publicKey, // Authority (owner of the source account)
            100_000_000 // Amount to transfer (0.1 tokens)
        );
        console.log('Transferred 0.1 tokens from Nemeos to the buyer.');

        // Check the balance of Nemeos' and the buyer's token accounts
        const nemeosAccountInfo2 = await getAccount(connection, nemeosTokenAccount.address);
        console.log('Nemeos account balance after transfer:', Number(nemeosAccountInfo2.amount) / LAMPORTS_PER_SOL);

        const buyerAccountInfo = await getAccount(connection, buyerTokenAccount.address);

        console.log('Buyer account balance:', Number(buyerAccountInfo.amount) / LAMPORTS_PER_SOL);

    });
});
