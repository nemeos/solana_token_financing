use anchor_lang::prelude::Pubkey;

// TESTNET AND DEVNET PUBKEYS
pub const USDC_PUBKEY: Pubkey = Pubkey::new_from_array([
    241, 20, 209, 39, 188, 126, 161, 73, 73, 190, 54, 151, 68, 17, 58, 239, 98, 158, 164, 9, 124,
    223, 211, 162, 167, 206, 133, 113, 155, 211, 114, 148,
]);
pub const NEMEOS_PUBKEY: Pubkey = Pubkey::new_from_array([
    248, 155, 48, 138, 222, 236, 69, 111, 10, 135, 44, 211, 156, 82, 171, 205, 109, 20, 18, 134,
    105, 240, 211, 174, 217, 252, 72, 147, 190, 41, 92, 38,
]);

// MAINNET PUBKEYS
// pub const USDC_PUBKEY: Pubkey = Pubkey::new_from_array([
//     TODO
// ]); // mainnet USDC pubkey
// pub const NEMEOS_PUBKEY: Pubkey = Pubkey::new_from_array([
//     TODO
// ]); // mainnet Nemeos pubkey

#[derive(Debug)]
pub struct Lot {
    pub token_quantity: u64,
    pub token_price: u64,
}

pub const LOTS: [Lot; 2] = [
    Lot {
        token_quantity: 100,
        token_price: 1_000_000, // 1 USDC
    },
    Lot {
        token_quantity: 1000,
        token_price: 900_000, // 0.9 USDC
    },
];

#[derive(Debug)]
pub struct Loan {
    pub period_duration_in_seconds: u64,
    pub nb_of_payments: u8, // including upfront
    pub upfront: u8,        // upfront except fees
    pub annual_interest_rate: u8,
}

pub const LOANS: [Loan; 3] = [
    Loan {
        period_duration_in_seconds: 60 * 60 * 24 * 14, // payment every two weeks
        nb_of_payments: 4,                             // including upfront
        upfront: 25,                                   // upfront except fees
        annual_interest_rate: 20,
    },
    Loan {
        period_duration_in_seconds: 60 * 60 * 24 * 30, // payment every 30 days
        nb_of_payments: 11,                            // including upfront
        upfront: 20,                                   // upfront except fees
        annual_interest_rate: 10,
    },
    Loan {
        period_duration_in_seconds: 3, // payment every 3s (for testing only)
        nb_of_payments: 4,             // including upfront
        upfront: 25,                   // upfront except fees
        annual_interest_rate: 20,
    },
];
