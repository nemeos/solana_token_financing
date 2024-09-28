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

function wait(seconds: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}

async function print_users_accounts(
    connection: anchor.web3.Connection,
    nemeosAccount: anchor.web3.PublicKey,
    sellerAccount: anchor.web3.PublicKey,
    sellerTokenAccount: anchor.web3.PublicKey,
    borrowerAccount: anchor.web3.PublicKey,
    borrowerTokenAccount?: anchor.web3.PublicKey,
): Promise<void> {
    const nemeosSol = await connection.getBalance(nemeosAccount);
    console.log(`Nemeos: ${nemeosSol / anchor.web3.LAMPORTS_PER_SOL} SOL`);

    const sellerSol = await connection.getBalance(sellerAccount);
    const sellerTokenInfo = await connection.getTokenAccountBalance(sellerTokenAccount);
    const sellerTokens = sellerTokenInfo.value.uiAmount;
    console.log(`Seller: ${sellerSol / anchor.web3.LAMPORTS_PER_SOL} SOL, ${sellerTokens} tokens`);

    const borrowerSol = await connection.getBalance(borrowerAccount);
    if (borrowerTokenAccount) {
        const borrowerTokenInfo = await connection.getTokenAccountBalance(borrowerTokenAccount);
        const borrowerTokens = borrowerTokenInfo.value.uiAmount;
        console.log(`Borrower: ${borrowerSol / anchor.web3.LAMPORTS_PER_SOL} SOL, ${borrowerTokens} tokens`);
    } else {
        console.log(`Borrower: ${borrowerSol / anchor.web3.LAMPORTS_PER_SOL} SOL`);
    }
}

async function print_vault(connection: anchor.web3.Connection, program: Program<SolanaTokenFinancing>, mint: anchor.web3.PublicKey): Promise<void> {
    const [vaultTokenAccount, _bumpVaultTokenAccountAddr] = await PublicKey.findProgramAddress(
        [Buffer.from("nemeos_vault_token_account"), mint.toBuffer()],
        program.programId
    );
    const vaultTokenInfo = await connection.getTokenAccountBalance(vaultTokenAccount);
    const vaultTokens = vaultTokenInfo.value.uiAmount;

    const [vaultAccountAddr, _bumpVaultAccountAddr] = await PublicKey.findProgramAddress(
        [Buffer.from("nemeos_vault_account"), mint.toBuffer()],
        program.programId
    );
    const vaultAccount = await program.account.vaultAccount.fetch(vaultAccountAddr);
    console.log(`Vault: ${vaultTokens} tokens including ${vaultAccount.availableTokens} available`);
}

describe("test 2", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolanaTokenFinancing as Program<SolanaTokenFinancing>;
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

    it("Full workflow", async () => {
        // Create keypairs
        const sellerKeypair = Keypair.generate();
        // console.log('Seller address:', sellerKeypair.publicKey.toBase58());
        const nemeosKeypair = Keypair.generate();
        // console.log('Nemeos address:', nemeosKeypair.publicKey.toBase58());
        const borrowerKeypair = Keypair.generate();
        // console.log('Borrower address:', borrowerKeypair.publicKey.toBase58());

        // Create accounts with airdrops
        let txSellerAirdrop = await connection.requestAirdrop(
            sellerKeypair.publicKey,
            5 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(txSellerAirdrop);
        let txNemeosAirdrop = await connection.requestAirdrop(
            nemeosKeypair.publicKey,
            5 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(txNemeosAirdrop);
        let txBorrowerAirdrop = await connection.requestAirdrop(
            borrowerKeypair.publicKey,
            50 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(txBorrowerAirdrop);

        // Create a SPL token
        const mint = await createMint(
            connection,
            sellerKeypair, // Payer
            sellerKeypair.publicKey, // Mint authority
            null, // Freeze authority
            2, // Decimals
        );
        // console.log('Mint address:', mint.toBase58());

        // Create an associated token account for the seller
        const sellerTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            sellerKeypair, // Payer
            mint, // SPL token address
            sellerKeypair.publicKey // Owner of the token account
        );
        // console.log('Seller token account:', sellerTokenAccount.address.toBase58());

        // Mint tokens to the seller's token account
        await mintTo(
            connection,
            sellerKeypair, // Payer
            mint, // SPL token address
            sellerTokenAccount.address, // Destination account
            sellerKeypair.publicKey, // Mint authority
            1_000 * 100 // Amount of tokens to mint (1_000 token with 2 decimals)
        );

        await print_users_accounts(connection, nemeosKeypair.publicKey, sellerKeypair.publicKey, sellerTokenAccount.address, borrowerKeypair.publicKey);

        // TEST : initialize_token_vault
        console.log(`*** Initialize token vault ****`);
        let txInitVault = await program.methods
            .initializeTokenVault(new BN(3))
            .accounts({
                mint: mint,
                seller: sellerKeypair.publicKey,
                nemeos: nemeosKeypair.publicKey,
            })
            .signers([sellerKeypair, nemeosKeypair])
            .rpc();
        await connection.confirmTransaction(txInitVault);

        await print_users_accounts(connection, nemeosKeypair.publicKey, sellerKeypair.publicKey, sellerTokenAccount.address, borrowerKeypair.publicKey);

        // TEST : deposit_tokens
        console.log(`*** Deposit tokens ****`);
        let txTokenDeposit = await program.methods
            .tokenDeposit(new BN(100))
            .accounts({
                seller: sellerKeypair.publicKey,
                sellerTokenAccount: sellerTokenAccount.address,
                mint: mint,
            })
            .signers([sellerKeypair])
            .rpc();
        await connection.confirmTransaction(txTokenDeposit);

        await print_users_accounts(connection, nemeosKeypair.publicKey, sellerKeypair.publicKey, sellerTokenAccount.address, borrowerKeypair.publicKey);
        await print_vault(connection, program, mint);

        // TEST : create_loan
        console.log(`*** Create loan ****`);
        let txCreateLoan = await program.methods
            .createLoan(new BN(10), new BN(5), new BN(2), new BN(3))
            .accounts({
                seller: sellerKeypair.publicKey,
                borrower: borrowerKeypair.publicKey,
                nemeos: nemeosKeypair.publicKey,
                mint: mint,
            })
            .signers([borrowerKeypair, sellerKeypair])
            .rpc();
        await connection.confirmTransaction(txCreateLoan);

        await print_users_accounts(connection, nemeosKeypair.publicKey, sellerKeypair.publicKey, sellerTokenAccount.address, borrowerKeypair.publicKey);
        await print_vault(connection, program, mint);

        // TEST : payment 1
        console.log(`*** Payment 1 ****`);
        await wait(1); // wait 1s
        let txPayment = await program.methods
            .payment()
            .accounts({
                seller: sellerKeypair.publicKey,
                borrower: borrowerKeypair.publicKey,
                mint: mint,
            })
            .signers([borrowerKeypair])
            .rpc();
        await connection.confirmTransaction(txPayment);

        let [borrowerTokenAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("nemeos_borrower_token_account"), mint.toBuffer(), borrowerKeypair.publicKey.toBuffer()],
            program.programId
        );

        await print_users_accounts(connection, nemeosKeypair.publicKey, sellerKeypair.publicKey, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerTokenAccount);
        await print_vault(connection, program, mint);

        // // TEST : close_loan after payment 1
        // console.log(`*** Close loan ****`);
        // await wait(5); // wait 5s
        // let txCloseLoanEarlier = await program.methods
        //     .closeLoan()
        //     .accounts({
        //         seller: sellerKeypair.publicKey,
        //         borrower: borrowerKeypair.publicKey,
        //         mint: mint,
        //     })
        //     .signers([])
        //     .rpc();
        // await connection.confirmTransaction(txCloseLoanEarlier);
        // await print_users_accounts(connection, nemeosKeypair.publicKey, sellerKeypair.publicKey, sellerTokenAccount.address, borrowerKeypair.publicKey);
        // await print_vault(connection, program, mint);

        // TEST : payment 2
        console.log(`*** Payment 2 ****`);
        await wait(3); // wait 3s
        let txPayment2 = await program.methods
            .payment()
            .accounts({
                seller: sellerKeypair.publicKey,
                borrower: borrowerKeypair.publicKey,
                mint: mint,
            })
            .signers([borrowerKeypair])
            .rpc();
        await connection.confirmTransaction(txPayment2);

        await print_users_accounts(connection, nemeosKeypair.publicKey, sellerKeypair.publicKey, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerTokenAccount);
        await print_vault(connection, program, mint);

        // // TEST : payment 3 (SHOULD FAIL)
        // console.log(`*** Payment 3 ****`);
        // await wait(3); // wait 3s
        // let txPayment3 = await program.methods
        //     .payment()
        //     .accounts({
        //         seller: sellerKeypair.publicKey,
        //         borrower: borrowerKeypair.publicKey,
        //         mint: mint,
        //     })
        //     .signers([borrowerKeypair])
        //     .rpc();
        // await connection.confirmTransaction(txPayment3);

        // TEST : close_loan
        console.log(`*** Close loan ****`);
        let txCloseLoan = await program.methods
            .closeLoan()
            .accounts({
                seller: sellerKeypair.publicKey,
                borrower: borrowerKeypair.publicKey,
                mint: mint,
            })
            .signers([])
            .rpc();
        await connection.confirmTransaction(txCloseLoan);

        await print_users_accounts(connection, nemeosKeypair.publicKey, sellerKeypair.publicKey, sellerTokenAccount.address, borrowerKeypair.publicKey);
        await print_vault(connection, program, mint);
    });
});
