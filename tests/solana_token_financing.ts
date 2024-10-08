import fs from 'fs';
import path from 'path';
import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {Connection, Keypair, PublicKey, LAMPORTS_PER_SOL} from '@solana/web3.js';
import BN from 'bn.js';
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress
} from '@solana/spl-token';
import {SolanaTokenFinancing} from "../target/types/solana_token_financing";

/*
Latest Devnet published addresses:

Nemeos address: HjTMrTj1kdp3MhwuxW6jZnUhpCVbibDrNKizEDF1Mu33
USDC address: HE5fcroCAV51ANSChXaSNkqYrkNP3kkXFJW7S1B2Uq8w
Admin address: 64tm7hWkkRRHMuGQaGuDm2MRRzV7Ez6oudLYyg4PzBu
Seller address: BQvGsESSd1Tn8pMvJ4skoAUrcox9MT4iUPdF8oBs1fQH
Borrower address: r9NqE9ftBf3TQyQq4up6MYfjJoePHYmze6qgrbDtohU
Borrower Phantom address: 53oGZxiUoxCBn1JK3tzhFE9Mf29Ci9BVYEtwtHFZDiTn
USDC Mint address: HE5fcroCAV51ANSChXaSNkqYrkNP3kkXFJW7S1B2Uq8w
Borrower payment account: 7TfoxmUNbHVE1mSUG9FZfx3iwr8fhEstPTK83MorJnXy
Phantom wallet manual test USDC account: BnUbq7W2rtowrgJSNfyXEKr3i3Keh9dXMGzAPNjgZ4nz
Mint address: 7MbXgBQv8ShWpf3k66f4gs6AdEnoeGoC16FBrkdrJTw3
Seller token account: Ebwbj2BWKDPC2kjY8KdSNkgoyFQaC1F3qWiasDHuu7nc
*/

const TOKEN_DECIMALS: number = 2;
const USDC_TOKEN_DECIMALS: number = 6;

const nemeosKeypair = get_keypair_from_json_file("../accounts/nemeos.json");

const usdcKeypair = get_keypair_from_json_file("../accounts/usdc.json");

const adminKeypair = get_keypair_from_json_file("../accounts/admin.json");
const sellerKeypair = get_keypair_from_json_file("../accounts/seller.json");
const borrowerKeypair = get_keypair_from_json_file("../accounts/borrower.json");
const mintKeypair = get_keypair_from_json_file("../accounts/mint.json");

// Phantom wallet manual test, passphrase is `claw blame sorry warrior true uphold hurt smooth express leopard hope fiction`
const phantomWalletManualTestPubkey = new PublicKey("53oGZxiUoxCBn1JK3tzhFE9Mf29Ci9BVYEtwtHFZDiTn");

function wait(seconds: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}

function get_keypair_from_json_file(file_path: string): Keypair {
    const privateKeyJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, file_path), 'utf-8'));
    const secretKey = new Uint8Array(privateKeyJson);
    return Keypair.fromSecretKey(secretKey);
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
    borrowerTokenAccount: anchor.web3.PublicKey | undefined,
    phantomWalletManualTestPubkey: anchor.web3.PublicKey,
    phantomWalletManualTestUsdcAccount: anchor.web3.PublicKey,
    getPhantomWalletManualTestTokenAccount: () => Promise<anchor.web3.PublicKey | null> = () => Promise.resolve(null)
): Promise<void> {
    console.log('\n=========== User accounts ===========');
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
    
    const phantomWalletManualTestSol = await connection.getBalance(phantomWalletManualTestPubkey);
    const phantomWalletManualTestUsdcInfo = await connection.getTokenAccountBalance(phantomWalletManualTestUsdcAccount);
    const phantomWalletManualTestUsdcAmount = phantomWalletManualTestUsdcInfo.value.uiAmount;
    let phantomWalletManualTestTokenAccount = await getPhantomWalletManualTestTokenAccount();
    if (phantomWalletManualTestTokenAccount) {
        const phantomWalletManualTestTokenInfo = await connection.getTokenAccountBalance(phantomWalletManualTestTokenAccount)
            .catch(() => null);
        const phantomWalletManualTestTokens = !!phantomWalletManualTestTokenInfo ? phantomWalletManualTestTokenInfo.value.uiAmount : '[Not Created Account]';
        console.log(`Phantom wallet manual test: ${phantomWalletManualTestSol / anchor.web3.LAMPORTS_PER_SOL} SOL, ${phantomWalletManualTestUsdcAmount} USDC, ${phantomWalletManualTestTokens} tokens`);
    } else {
        console.log(`Phantom wallet manual test: ${phantomWalletManualTestSol / anchor.web3.LAMPORTS_PER_SOL} SOL, ${phantomWalletManualTestUsdcAmount} USDC`);
    }
    console.log('=====================================\n');
}

async function print_vault(connection: anchor.web3.Connection, program: Program<SolanaTokenFinancing>, mint: anchor.web3.PublicKey): Promise<void> {
    console.log('\n=========== Vault ===========');
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
    console.log('=============================\n');
}

describe("solana_token_financing dApp functional testing", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.SolanaTokenFinancing as Program<SolanaTokenFinancing>;
    const connection = new Connection(
        'http://127.0.0.1:8899',
        // 'https://api.devnet.solana.com',
        'confirmed'
    );

    it("Full workflow", async () => {
        console.log(`*** Initialize accounts and create a SPL token ***`);
        // Create keypairs
        // const adminKeypair = Keypair.generate();
        // Create keypairs
        // const sellerKeypair = Keypair.generate();
        // const borrowerKeypair = Keypair.generate();
        console.log('Nemeos address:', nemeosKeypair.publicKey.toBase58());
        console.log('USDC address:', usdcKeypair.publicKey.toBase58());
        console.log('Admin address:', adminKeypair.publicKey.toBase58());
        console.log('Seller address:', sellerKeypair.publicKey.toBase58());
        console.log('Borrower address:', borrowerKeypair.publicKey.toBase58());
        console.log('Borrower Phantom address:', phantomWalletManualTestPubkey.toBase58());

        // Create accounts with airdrops
        let txAdminAirdrop = await connection.requestAirdrop(
            adminKeypair.publicKey,
            5 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(txAdminAirdrop);
        let txSellerAirdrop = await connection.requestAirdrop(
            sellerKeypair.publicKey,
            5 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(txSellerAirdrop);
        let txPhantomWalletManualTestSolAirdrop = await connection.requestAirdrop(
            phantomWalletManualTestPubkey,
            5 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(txPhantomWalletManualTestSolAirdrop);
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
        // const usdcMint = usdcKeypair.publicKey
        console.log('USDC Mint address:', usdcMint.toBase58());
        const borrowerPaymentAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            adminKeypair, // Payer
            usdcMint, // SPL token address
            borrowerKeypair.publicKey // Owner of the token account
        );
        const phantomWalletManualTestUsdcAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            adminKeypair, // Payer
            usdcMint, // SPL token address
            phantomWalletManualTestPubkey // Owner of the token account
        );
        console.log('Borrower payment account:', borrowerPaymentAccount.address.toBase58());
        console.log('Phantom wallet manual test USDC account:', phantomWalletManualTestUsdcAccount.address.toBase58());
        await mintTo( // Send USDC to borrower
            connection,
            adminKeypair, // Payer
            usdcMint, // SPL token address
            borrowerPaymentAccount.address, // Destination account
            adminKeypair.publicKey, // Mint authority
            1_000 * 10 ** USDC_TOKEN_DECIMALS // Amount of tokens to mint (1_000 USDC)
        );
        await mintTo( // Send USDC to borrower 2 (for manual test in Phantom extension wallet)
            connection,
            adminKeypair, // Payer
            usdcMint, // SPL token address
            phantomWalletManualTestUsdcAccount.address, // Destination account
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

        // Create a SPL token (token from partner ICO that we wish to purchase)
        const mint = await createMint(
            connection,
            adminKeypair, // Payer
            adminKeypair.publicKey, // Mint authority
            null, // Freeze authority
            TOKEN_DECIMALS, // Decimals
            mintKeypair,
        );
        // const mint = mintKeypair.publicKey
        console.log('Mint address:', mint.toBase58());

        // Create an associated token account for the seller
        const sellerTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            adminKeypair, // Payer
            mint, // SPL token address
            sellerKeypair.publicKey // Owner of the token account
        );
        console.log('Seller token account:', sellerTokenAccount.address.toBase58());

        // Mint tokens to the seller's token account
        await mintTo(
            connection,
            adminKeypair, // Payer
            mint, // SPL token address
            sellerTokenAccount.address, // Destination account
            adminKeypair.publicKey, // Mint authority
            1_000 * 10 ** TOKEN_DECIMALS // Amount of tokens to mint (1_000 token)
        );

        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, undefined, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address);

        console.log(`*** Initialize token_account_owner_pda account ***`);
        let txInitTokenAccountOwner = await program.methods
            .initializeTokenAccountOwnerPda()
            .accounts({
                nemeos: nemeosKeypair.publicKey,
            })
            .signers([nemeosKeypair])
            .rpc();
        await connection.confirmTransaction(txInitTokenAccountOwner);
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, undefined, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address);

        // TEST : initialize_token_vault
        console.log(`*** Initialize token vault ***`);
        let txInitVault = await program.methods
            .initializeTokenVault()
            .accounts({
                mint: mint,
                seller: sellerKeypair.publicKey,
                nemeos: nemeosKeypair.publicKey,
            })
            .signers([nemeosKeypair])
            .rpc();
        await connection.confirmTransaction(txInitVault);
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, undefined, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address);
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
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, undefined, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address);
        await print_vault(connection, program, mint);

        // Retrieve payment addresses
        const nemeosUsdcAccount = await getAssociatedTokenAddress(
            usdcMint,
            nemeosKeypair.publicKey,
            false,
            TOKEN_PROGRAM_ID
        );
        let [vaultAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("nemeos_vault_account"), mint.toBuffer()],
            program.programId
        );
        const vaultAccountInfo = await program.account.vaultAccount.fetch(vaultAccount);
        const sellerUsdcAccount = await getAssociatedTokenAddress(
            usdcMint,
            vaultAccountInfo.seller,
            false,
            TOKEN_PROGRAM_ID
        );

        // TEST : create_loan
        console.log(`*** Create loan ***`);
        console.log({
            borrower: borrowerKeypair.publicKey,
            nemeosPaymentAccount: nemeosUsdcAccount,
            borrowerPaymentAccount: borrowerPaymentAccount.address,
            mint: mint,
        })
        let txCreateLoan = await program.methods
            .createLoan(new BN(2), new BN(0), new BN(2))
            .accounts({
                borrower: borrowerKeypair.publicKey,
                nemeosPaymentAccount: nemeosUsdcAccount,
                borrowerPaymentAccount: borrowerPaymentAccount.address,
                mint: mint,
            })
            .signers([borrowerKeypair])
            .rpc();
        await connection.confirmTransaction(txCreateLoan);
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, undefined, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address);
        await print_vault(connection, program, mint);

        let [loanAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("nemeos_loan_account"), mint.toBuffer(), borrowerKeypair.publicKey.toBuffer()],
            program.programId
        );
        const loanAccountInfo = await program.account.loanAccount.fetch(loanAccount);
        const deadline = new Date(loanAccountInfo.endPeriod * 1000);
        console.log(`Next payment: ${loanAccountInfo.paymentAmount / 10 ** USDC_TOKEN_DECIMALS} USDC before ${deadline.toISOString()}`);


        // TEST : upfront payment
        console.log(`*** Upfront payment ***`);
        let txUpfrontPayment = await program.methods
            .upfrontPayment()
            .accounts({
                borrower: borrowerKeypair.publicKey,
                sellerPaymentAccount: sellerUsdcAccount,
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
        const getPhantomWalletManualTestTokenAccount:() => Promise<anchor.web3.PublicKey | null> = async () => {
            try {
                let result = await PublicKey.findProgramAddress(
                    [Buffer.from("nemeos_borrower_token_account"), mint.toBuffer(), phantomWalletManualTestPubkey.toBuffer()],
                    program.programId
                );
                const phantomWalletManualTestTokenAccount = result[0]
                return phantomWalletManualTestTokenAccount;
            } catch (error) {
                return null
            }
        }
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address, getPhantomWalletManualTestTokenAccount);
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
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address, getPhantomWalletManualTestTokenAccount);
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
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address, getPhantomWalletManualTestTokenAccount);
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
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address, getPhantomWalletManualTestTokenAccount);
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
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address, getPhantomWalletManualTestTokenAccount);
        await print_vault(connection, program, mint);

        // TEST : payment 3
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
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address, getPhantomWalletManualTestTokenAccount);
        await print_vault(connection, program, mint);

        // Wait 24 hours on purpose to keep the cluster running for frontend development on https://localhost:8899
        // console.log(`*** Waiting 24 hours (keeping cluster open) ***`);
        // const logState = async () => {
        //     await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address, getPhantomWalletManualTestTokenAccount);
        //     await print_vault(connection, program, mint);
        // }
        // logState();
        // setInterval(logState, 15_000)
        // await wait(24 * 60 * 60);

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
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address, getPhantomWalletManualTestTokenAccount);
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
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address, getPhantomWalletManualTestTokenAccount);
        await print_vault(connection, program, mint);

        // TEST : close_vault_accounts
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
        await print_users_accounts(connection, nemeosKeypair.publicKey, nemeosPaymentAccount.address, sellerKeypair.publicKey, sellerPaymentAccount.address, sellerTokenAccount.address, borrowerKeypair.publicKey, borrowerPaymentAccount.address, borrowerTokenAccount, phantomWalletManualTestPubkey, phantomWalletManualTestUsdcAccount.address, getPhantomWalletManualTestTokenAccount);
    });
});
