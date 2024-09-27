import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {Connection, Keypair, PublicKey, LAMPORTS_PER_SOL} from '@solana/web3.js';
import BN from 'bn.js';
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    getAccount,
    transfer,
} from '@solana/spl-token';
import {SolanaTokenFinancing} from "../target/types/solana_token_financing";

describe("test 2", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolanaTokenFinancing as Program<SolanaTokenFinancing>;
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

    it("Full workflow", async () => {
        const sellerKeypair = Keypair.generate();
        console.log('Seller address:', sellerKeypair.publicKey.toBase58());
        const nemeosKeypair = Keypair.generate();
        console.log('Nemeos address:', nemeosKeypair.publicKey.toBase58());

        // Airdrops
        let txSellerAirdrop = await connection.requestAirdrop(
            sellerKeypair.publicKey,
            5 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(txSellerAirdrop);

        // TEST : initialize_token_vault
        // Create a SPL token
        const mint = await createMint(
            connection,
            sellerKeypair, // Payer
            sellerKeypair.publicKey, // Mint authority
            null, // Freeze authority
            1, // Decimals
        );
        console.log('Mint address:', mint.toBase58());

        let txInitVault = await program.methods
            .initializeTokenVault(nemeosKeypair.publicKey)
            .accounts({
                mint: mint,
                seller: sellerKeypair.publicKey,
            })
            .signers([sellerKeypair])
            .rpc();
        await connection.confirmTransaction(txInitVault);

        const balanceSeller = await connection.getBalance(sellerKeypair.publicKey);
        console.log(`Seller balance (SOL): ${balanceSeller / anchor.web3.LAMPORTS_PER_SOL} SOL`);

        const vaults = await program.account.vaultAccount.all();
        console.log(`Proposal result: `, vaults);

        // TEST : deposit_tokens
        // Create an associated token account for the seller
        const sellerTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            sellerKeypair, // Payer
            mint, // SPL token address
            sellerKeypair.publicKey // Owner of the token account
        );
        console.log('Seller token account:', sellerTokenAccount.address.toBase58());

        // Mint tokens to the seller's token account
        await mintTo(
            connection,
            sellerKeypair, // Payer
            mint, // SPL token address
            sellerTokenAccount.address, // Destination account
            sellerKeypair.publicKey, // Mint authority
            1_000_000_000 // Amount of tokens to mint (1 token with 9 decimals)
        );

        // Check the balance of the user's token account
        const sellerAccountInfo = await getAccount(connection, sellerTokenAccount.address);
        console.log('Seller token account balance:', Number(sellerAccountInfo.amount));

        const [vaultAccountAddr, _] = await PublicKey.findProgramAddress(
            [Buffer.from("nemeos_vault"), mint.toBuffer()],
            program.programId
        );
        const vaultAccount = await program.account.vaultAccount.fetch(vaultAccountAddr);

        let txTokenDeposit = await program.methods
            .tokenDeposit(new BN(100))
            .accounts({
                tokenAccount: vaultAccount.tokenAccount,
                vaultAccount: vaultAccountAddr,
                seller: sellerKeypair.publicKey,
                sellerTokenAccount: sellerTokenAccount.address,
            })
            .signers([sellerKeypair])
            .rpc();
        await connection.confirmTransaction(txTokenDeposit);

        const vaults2 = await program.account.vaultAccount.all();
        console.log(`Proposal result: `, vaults2);
        console.log(`Available tokens: `, vaults2[0].account.availableTokens.toString());
        const sellerAccountInfo2 = await getAccount(connection, sellerTokenAccount.address);
        console.log('Seller token account balance:', Number(sellerAccountInfo2.amount));
    });
});
