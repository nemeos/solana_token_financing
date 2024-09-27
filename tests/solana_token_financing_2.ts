import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {Connection, Keypair, PublicKey, LAMPORTS_PER_SOL} from '@solana/web3.js';
import {
    createMint,
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

        // Create a SPL token
        const mint = await createMint(
            connection,
            sellerKeypair, // Payer
            sellerKeypair.publicKey, // Mint authority
            null, // Freeze authority
            9, // Decimals
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
        console.log(`Seller balance: ${balanceSeller / anchor.web3.LAMPORTS_PER_SOL} SOL`);

        const vaults = await program.account.vaultAccount.all();
        console.log(`Proposal result: `, vaults);

    });
});
