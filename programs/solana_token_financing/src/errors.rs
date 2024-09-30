use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("An overflow occurred.")]
    Overflow,

    #[msg("The vault token account does not match the vault account.")]
    InvalidVaultTokenAccount,

    #[msg("The payment is too late.")]
    TooLate,

    #[msg("The payment is too early.")]
    TooEarly,

    #[msg("The loan is already fully paid.")]
    NoRemainingPayments,

    #[msg("Impossible to close loan: the loan is still in progress.")]
    ImpossibleToCloseLoan,

    #[msg("Impossible to vault accounts: the vault account still holds tokens that have already been promised.")]
    ImpossibleToCloseVaultAccounts,

    #[msg("The payment currency is not the same as the one expected.")]
    WrongCurrency,

    #[msg("The payment receiver is not the same as the one expected.")]
    WrongReceiver,

    #[msg("The instruction is not from Nemeos.")]
    NemeosInstruction,

    #[msg("Impossible to create the loan (the lot id does not exist).")]
    LotNotFound,

    #[msg("Impossible to create the loan (the loan id does not exist).")]
    LoanNotFound,

    #[msg("The upfront payment is required to initialize the loan.")]
    UpfrontPaymentRequired,

    #[msg("The upfront payment has already been payed.")]
    UpfrontAlreadyPayed,
}
