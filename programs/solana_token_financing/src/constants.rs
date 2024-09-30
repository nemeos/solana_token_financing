use anchor_lang::prelude::Pubkey;

// TEST PUBKEYS
pub const USDC_PUBKEY: Pubkey = Pubkey::new_from_array([
    89, 24, 241, 73, 229, 179, 188, 231, 249, 4, 104, 73, 208, 231, 223, 235, 150, 243, 138, 134,
    203, 162, 11, 66, 175, 217, 219, 38, 5, 106, 164, 53,
]);
pub const NEMEOS_PUBKEY: Pubkey = Pubkey::new_from_array([
    126, 126, 148, 150, 215, 210, 102, 25, 54, 38, 163, 50, 149, 195, 78, 33, 157, 3, 67, 149, 70,
    58, 100, 128, 244, 54, 5, 15, 195, 105, 251, 222,
]);

// MAINNET PUBKEYS
// pub const USDC_PUBKEY: Pubkey = Pubkey::new_from_array([
//     TODO
// ]); // mainnet USDC pubkey
// pub const NEMEOS_PUBKEY: Pubkey = Pubkey::new_from_array([
//     TODO
// ]); // mainnet Nemeos pubkey

#[derive(Debug)]
struct Lot {
    token_quantity: u64,
    token_price: f64,
}

const LOTS: [Lot; 2] = [
    Lot {
        token_quantity: 100,
        token_price: 1.0, // 1 USDC
    },
    Lot {
        token_quantity: 1000,
        token_price: 0.9, // 0.9 USDC
    },
];

#[derive(Debug)]
struct Loan {
    period_duration_in_seconds: u64,
    nb_of_payments: u8, // including upfront
    upfront: u8,        // upfront except fees
    annual_interest_rate: u8,
}

const LOANS: [Loan; 3] = [
    Loan {
        period_duration_in_seconds: 60 * 60 * 24 * 14, // payment every two weeks
        nb_of_payments: 4,                             // including upfront
        upfront: 25,                                   // upfront except fees
        annual_interest_rate: 20,
    },
    Loan {
        period_duration_in_seconds: 60 * 60 * 24 * 30, // payment every 30 days
        nb_of_payments: 12,                            // including upfront
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
