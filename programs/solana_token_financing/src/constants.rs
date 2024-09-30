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
