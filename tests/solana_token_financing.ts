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

const TOKEN_DECIMALS: number = 2;
const USDC_TOKEN_DECIMALS: number = 6;

const usdcSecretKey = new Uint8Array([
    136, 123, 222, 14, 134, 218, 188, 140, 238, 149, 208, 250, 205, 76, 165, 229,
    208, 81, 61, 48, 92, 78, 100, 116, 240, 169, 177, 29, 175, 38, 77, 216, 89,
    24, 241, 73, 229, 179, 188, 231, 249, 4, 104, 73, 208, 231, 223, 235, 150,
    243, 138, 134, 203, 162, 11, 66, 175, 217, 219, 38, 5, 106, 164, 53
]);
const usdcKeypair = Keypair.fromSecretKey(usdcSecretKey);

const nemeosSecretKey = new Uint8Array([218, 148, 167, 119, 201, 37, 97, 57, 66, 144, 30, 136, 77, 164, 144, 110, 11, 160, 213, 58, 108, 194, 97, 221, 163, 254, 90, 210, 139, 172, 80, 200, 126, 126, 148, 150, 215, 210, 102, 25, 54, 38, 163, 50, 149, 195, 78, 33, 157, 3, 67, 149, 70, 58, 100, 128, 244, 54, 5, 15, 195, 105, 251, 222]);
const nemeosKeypair = Keypair.fromSecretKey(nemeosSecretKey);

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
    nemeosPaymentAccount: anchor.web3.PublicKey,
    sellerAccount: anchor.web3.PublicKey,
    sellerPaymentAccount: anchor.web3.PublicKey,
    sellerTokenAccount: anchor.web3.PublicKey,
    borrowerAccount: anchor.web3.PublicKey,
    borrowerPaymentAccount: anchor.web3.PublicKey,
    borrowerTokenAccount?: anchor.web3.PublicKey,
): Promise<void> {
    const nemeosSol = await connection.getBalance(nemeosAccount);
    const nemeosPaymentInfo = await connection.getTokenAccountBalance(nemeosPaymentAccount);
    const nemeosPaymentAmount = nemeosPaymentInfo.value.uiAmount;
    console.log(`Nemeos: ${nemeosSol / anchor.web3.LAMPORTS_PER_SOL} SOL, ${nemeosPaymentAmount} USDC`);

    const sellerSol = await connection.getBalance(sellerAccount);
    const sellerPaymentInfo = await connection.getTokenAccountBalance(sellerPaymentAccount);
    const sellerPaymentAmount = sellerPaymentInfo.value.uiAmount;
    const sellerTokenInfo = await connection.getTokenAccountBalance(sellerTokenAccount);
    const sellerTokens = sellerTokenInfo.value.uiAmount;
    console.log(`Seller: ${sellerSol / anchor.web3.LAMPORTS_PER_SOL} SOL, ${sellerPaymentAmount} USDC, ${sellerTokens} tokens`);

    const borrowerSol = await connection.getBalance(borrowerAccount);
    const borrowerPaymentInfo = await connection.getTokenAccountBalance(borrowerPaymentAccount);
    const borrowerPaymentAmount = borrowerPaymentInfo.value.uiAmount;
    if (borrowerTokenAccount) {
        const borrowerTokenInfo = await connection.getTokenAccountBalance(borrowerTokenAccount);
        const borrowerTokens = borrowerTokenInfo.value.uiAmount;
        console.log(`Borrower: ${borrowerSol / anchor.web3.LAMPORTS_PER_SOL} SOL, ${borrowerPaymentAmount} USDC, ${borrowerTokens} tokens`);
    } else {
        console.log(`Borrower: ${borrowerSol / anchor.web3.LAMPORTS_PER_SOL} SOL, ${borrowerPaymentAmount} USDC`);
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
    console.log(`Vault: ${vaultTokens} tokens including ${vaultAccount.availableTokens / 10 ** TOKEN_DECIMALS} available`);
}

describe("solana_token_financing dApp functional testing", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolanaTokenFinancing as Program<SolanaTokenFinancing>;
    const connection = new Connection('http://127.0.0.1:8899', 'confirmed');

    it("Full workflow", async () => {
        console.log(`*** Initialize accounts and create a SPL token ***`);
        // Create keypairs
        const adminKeypair = Keypair.generate();
        // Create keypairs
        const sellerKeypair = Keypair.generate();
        // console.log('Seller address:', sellerKeypair.publicKey.toBase58());
        const borrowerKeypair = Keypair.generate();
        // console.log('Borrower address:', borrowerKeypair.publicKey.toBase58());

        // Create accounts with airdrops
        let txAdminAirdrop = await connection.requestAirdrop(
            adminKeypair.publicKey,
            5 * LAMPORTS_PER_SOL
        );
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

        // Create payment currency and fill accounts
        const usdcMint = await createMint(
            connection,
            adminKeypair, // Payer
            adminKeypair.publicKey, // Mint authority
            null, // Freeze authority
            USDC_TOKEN_DECIMALS, // Decimals
            usdcKeypair,
        );
        const borrowerPaymentAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            adminKeypair, // Payer
            usdcMint, // SPL token address
            borrowerKeypair.publicKey // Owner of the token account
        );
        await mintTo(
            connection,
            adminKeypair, // Payer
            usdcMint, // SPL token address
            borrowerPaymentAccount.address, // Destination account
            adminKeypair.publicKey, // Mint authority
            1_000 * 10 ** USDC_TOKEN_DECIMALS // Amount of tokens to mint (1_000 USDC)
        );
        const sellerPaymentAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            adminKeypair, // Payer
            usdcMint, // SPL token address
            sellerKeypair.publicKey // Owner of the token account
        );
        const nemeosPaymentAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            adminKeypair, // Payer
            usdcMint, // SPL token address
            nemeosKeypair.publicKey // Owner of the token account
        );

        // Create a SPL token
        const mint = await createMint(
            connection,
            adminKeypair, // Payer
            adminKeypair.publicKey, // Mint authority
            null, // Freeze authority
            TOKEN_DECIMALS, // Decimals
        );
        // console.log('Mint address:', mint.toBase58());

        // Create an associated token account for the seller
        const sellerTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            adminKeypair, // Payer
            mint, // SPL token address
            sellerKeypair.publicKey // Owner of the token account
        );
        // console.log('Seller token account:', sellerTokenAccount.address.toBase58());

        // Mint tokens to the seller's token account
        await mintTo(
            connection,
            adminKeypair, // Payer
            mint, // SPL token address
            sellerTokenAccount.address, // Destination account
            adminKeypair.publicKey, // Mint authority
            1_000 * 10 ** TOKEN_DECIMALS // Amount of tokens to mint (1_000 token)
        );

        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address);

        // TEST : initialize_token_vault
        console.log(`*** Initialize token vault ***`);
        let txInitVault = await program.methods
            .initializeTokenVault(new BN(3))
            .accounts({
                mint: mint,
                seller: sellerKeypair.publicKey,
                nemeos: nemeosKeypair.publicKey,
            })
            .signers([nemeosKeypair])
            .rpc();
        await connection.confirmTransaction(txInitVault);
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address);
        await print_vault(connection, program, mint);

        // TEST : deposit_tokens
        console.log(`*** Deposit tokens ***`);
        let txTokenDeposit = await program.methods
            .tokenDeposit(new BN(1000 * 10 ** TOKEN_DECIMALS))
            .accounts({
                seller: sellerKeypair.publicKey,
                sellerTokenAccount: sellerTokenAccount.address,
                mint: mint,
            })
            .signers([sellerKeypair])
            .rpc();
        await connection.confirmTransaction(txTokenDeposit);
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address);
        await print_vault(connection, program, mint);

        // TEST : create_loan
        console.log(`*** Create loan ***`);
        let txCreateLoan = await program.methods
            .createLoan(new BN(2), new BN(0), new BN(2))
            .accounts({
                seller: sellerKeypair.publicKey,
                borrower: borrowerKeypair.publicKey,
                nemeosPaymentAccount: nemeosPaymentAccount.address,
                borrowerPaymentAccount: borrowerPaymentAccount.address,
                mint: mint,
            })
            .signers([borrowerKeypair, sellerKeypair])
            .rpc();
        await connection.confirmTransaction(txCreateLoan);
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address);
        await print_vault(connection, program, mint);

        // TEST : upfront payment
        console.log(`*** Upfront payment ***`);
        let txUpfrontPayment = await program.methods
            .upfrontPayment()
            .accounts({
                borrower: borrowerKeypair.publicKey,
                sellerPaymentAccount: sellerPaymentAccount.address,
                borrowerPaymentAccount: borrowerPaymentAccount.address,
                mint: mint,
            })
            .signers([borrowerKeypair])
            .rpc();
        await connection.confirmTransaction(txUpfrontPayment);
        let [borrowerTokenAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("nemeos_borrower_token_account"), mint.toBuffer(), borrowerKeypair.publicKey.toBuffer()],
            program.programId
        );
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount);
        await print_vault(connection, program, mint);

        // // TEST : full early repayment
        // console.log(`*** Full early repayment ***`);
        // let txFullEarlyRepayment = await program.methods
        //     .fullEarlyRepayment()
        //     .accounts({
        //         borrower: borrowerKeypair.publicKey,
        //         borrowerPaymentAccount: borrowerPaymentAccount.address,
        //         sellerPaymentAccount: sellerPaymentAccount.address,
        //         nemeosPaymentAccount: nemeosPaymentAccount.address,
        //         mint: mint,
        //     })
        //     .signers([borrowerKeypair])
        //     .rpc();
        // await connection.confirmTransaction(txFullEarlyRepayment);
        // let [borrowerTokenAccountEarly] = PublicKey.findProgramAddressSync(
        //     [Buffer.from("nemeos_borrower_token_account"), mint.toBuffer(), borrowerKeypair.publicKey.toBuffer()],
        //     program.programId
        // );
        // await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccountEarly);
        // await print_vault(connection, program, mint);

        // TEST : payment 1
        console.log(`*** Payment 1 ***`);
        await wait(1); // wait 1s
        let txPayment = await program.methods
            .payment()
            .accounts({
                borrower: borrowerKeypair.publicKey,
                sellerPaymentAccount: sellerPaymentAccount.address,
                borrowerPaymentAccount: borrowerPaymentAccount.address,
                mint: mint,
            })
            .signers([borrowerKeypair])
            .rpc();
        await connection.confirmTransaction(txPayment);
        // let [borrowerTokenAccount] = PublicKey.findProgramAddressSync(
        //     [Buffer.from("nemeos_borrower_token_account"), mint.toBuffer(), borrowerKeypair.publicKey.toBuffer()],
        //     program.programId
        // );
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount);
        await print_vault(connection, program, mint);

        // // TEST : close_loan after payment 1
        // console.log(`*** Close loan ***`);
        // await wait(5); // wait 5s
        // let txCloseLoanEarlier = await program.methods
        //     .closeLoan()
        //     .accounts({
        //         borrower: borrowerKeypair.publicKey,
        //         mint: mint,
        //     })
        //     .signers([])
        //     .rpc();
        // await connection.confirmTransaction(txCloseLoanEarlier);
        // await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount);
        // await print_vault(connection, program, mint);

        // // TEST : full early repayment
        // console.log(`*** Full early repayment ***`);
        // let txFullEarlyRepayment = await program.methods
        //     .fullEarlyRepayment()
        //     .accounts({
        //         borrower: borrowerKeypair.publicKey,
        //         borrowerPaymentAccount: borrowerPaymentAccount.address,
        //         sellerPaymentAccount: sellerPaymentAccount.address,
        //         nemeosPaymentAccount: nemeosPaymentAccount.address,
        //         mint: mint,
        //     })
        //     .signers([borrowerKeypair])
        //     .rpc();
        // await connection.confirmTransaction(txFullEarlyRepayment);
        // await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount);
        // await print_vault(connection, program, mint);

        // TEST : payment 2
        console.log(`*** Payment 2 ***`);
        await wait(3); // wait 3s
        let txPayment2 = await program.methods
            .payment()
            .accounts({
                borrower: borrowerKeypair.publicKey,
                sellerPaymentAccount: sellerPaymentAccount.address,
                borrowerPaymentAccount: borrowerPaymentAccount.address,
                mint: mint,
            })
            .signers([borrowerKeypair])
            .rpc();
        await connection.confirmTransaction(txPayment2);
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount);
        await print_vault(connection, program, mint);

        // TEST : payment 3 (SHOULD FAIL)
        console.log(`*** Payment 3 ***`);
        await wait(3); // wait 3s
        let txPayment3 = await program.methods
            .payment()
            .accounts({
                borrower: borrowerKeypair.publicKey,
                sellerPaymentAccount: sellerPaymentAccount.address,
                borrowerPaymentAccount: borrowerPaymentAccount.address,
                mint: mint,
            })
            .signers([borrowerKeypair])
            .rpc();
        await connection.confirmTransaction(txPayment3);
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount);
        await print_vault(connection, program, mint);

        // // TEST : payment 4 (SHOULD FAIL)
        // console.log(`*** Payment 4 ***`);
        // await wait(3); // wait 3s
        // let txPayment4 = await program.methods
        //     .payment()
        //     .accounts({
        //         borrower: borrowerKeypair.publicKey,
        //         sellerPaymentAccount: sellerPaymentAccount.address,
        //         borrowerPaymentAccount: borrowerPaymentAccount.address,
        //         mint: mint,
        //     })
        //     .signers([borrowerKeypair])
        //     .rpc();
        // await connection.confirmTransaction(txPayment4);

        // TEST : close_loan
        console.log(`*** Close loan ***`);
        let txCloseLoan = await program.methods
            .closeLoan()
            .accounts({
                borrower: borrowerKeypair.publicKey,
                mint: mint,
            })
            .signers([])
            .rpc();
        await connection.confirmTransaction(txCloseLoan);
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount);
        await print_vault(connection, program, mint);

        // TEST : token_withdraw
        console.log(`*** Token withdraw ***`);
        let txTokenWithdraw = await program.methods
            .tokenWithdraw(new BN(50 * 10 ** TOKEN_DECIMALS))
            .accounts({
                seller: sellerKeypair.publicKey,
                sellerTokenAccount: sellerTokenAccount.address,
                mint: mint,
            })
            .signers([sellerKeypair])
            .rpc();
        await connection.confirmTransaction(txTokenWithdraw);
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount);
        await print_vault(connection, program, mint);

        // TEST : close_loan
        console.log(`*** Close vault accounts ***`);
        let txCloseVaultAccounts = await program.methods
            .closeVaultAccounts()
            .accounts({
                seller: sellerKeypair.publicKey,
                sellerTokenAccount: sellerTokenAccount.address,
                mint: mint,
            })
            .signers([sellerKeypair])
            .rpc();
        await connection.confirmTransaction(txCloseVaultAccounts);
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount);
    });
});
