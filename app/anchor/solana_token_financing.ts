/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_token_financing.json`.
 */
export type SolanaTokenFinancing = {
  "address": "Hpgeu13zWB2NnsmsX84P5mhor8MoYWyqYnm8uWrvuvY6",
  "metadata": {
    "name": "solanaTokenFinancing",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "closeLoan",
      "discriminator": [
        96,
        114,
        111,
        204,
        149,
        228,
        235,
        124
      ],
      "accounts": [
        {
          "name": "loanAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  108,
                  111,
                  97,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "borrower"
              }
            ]
          }
        },
        {
          "name": "vaultAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "borrower",
          "writable": true,
          "relations": [
            "loanAccount"
          ]
        },
        {
          "name": "mint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeVaultAccounts",
      "discriminator": [
        242,
        171,
        222,
        209,
        203,
        26,
        55,
        142
      ],
      "accounts": [
        {
          "name": "tokenAccountOwnerPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                  95,
                  111,
                  119,
                  110,
                  101,
                  114,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "vaultAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "sellerTokenAccount",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "createLoan",
      "discriminator": [
        166,
        131,
        118,
        219,
        138,
        218,
        206,
        140
      ],
      "accounts": [
        {
          "name": "loanAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  108,
                  111,
                  97,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "borrower"
              }
            ]
          }
        },
        {
          "name": "borrower",
          "writable": true,
          "signer": true
        },
        {
          "name": "nemeosPaymentAccount",
          "writable": true
        },
        {
          "name": "borrowerPaymentAccount",
          "writable": true
        },
        {
          "name": "vaultAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "lotQuantity",
          "type": "u8"
        },
        {
          "name": "lotId",
          "type": "u8"
        },
        {
          "name": "loanId",
          "type": "u8"
        }
      ]
    },
    {
      "name": "fullEarlyRepayment",
      "discriminator": [
        95,
        247,
        167,
        190,
        171,
        161,
        23,
        224
      ],
      "accounts": [
        {
          "name": "loanAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  108,
                  111,
                  97,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "borrower"
              }
            ]
          }
        },
        {
          "name": "tokenAccountOwnerPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                  95,
                  111,
                  119,
                  110,
                  101,
                  114,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "borrowerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  98,
                  111,
                  114,
                  114,
                  111,
                  119,
                  101,
                  114,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "borrower"
              }
            ]
          }
        },
        {
          "name": "borrower",
          "writable": true,
          "signer": true
        },
        {
          "name": "sellerPaymentAccount",
          "writable": true
        },
        {
          "name": "borrowerPaymentAccount",
          "writable": true
        },
        {
          "name": "nemeosPaymentAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "initializeTokenAccountOwnerPda",
      "discriminator": [
        242,
        15,
        95,
        209,
        150,
        229,
        28,
        4
      ],
      "accounts": [
        {
          "name": "tokenAccountOwnerPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                  95,
                  111,
                  119,
                  110,
                  101,
                  114,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "nemeos",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "initializeTokenVault",
      "discriminator": [
        64,
        202,
        113,
        205,
        22,
        210,
        178,
        225
      ],
      "accounts": [
        {
          "name": "tokenAccountOwnerPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                  95,
                  111,
                  119,
                  110,
                  101,
                  114,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "vaultAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "seller"
        },
        {
          "name": "nemeos",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "payment",
      "discriminator": [
        156,
        226,
        80,
        91,
        104,
        252,
        49,
        142
      ],
      "accounts": [
        {
          "name": "loanAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  108,
                  111,
                  97,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "borrower"
              }
            ]
          }
        },
        {
          "name": "tokenAccountOwnerPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                  95,
                  111,
                  119,
                  110,
                  101,
                  114,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "borrowerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  98,
                  111,
                  114,
                  114,
                  111,
                  119,
                  101,
                  114,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "borrower"
              }
            ]
          }
        },
        {
          "name": "borrower",
          "writable": true,
          "signer": true
        },
        {
          "name": "sellerPaymentAccount",
          "writable": true
        },
        {
          "name": "borrowerPaymentAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "tokenDeposit",
      "discriminator": [
        117,
        255,
        154,
        71,
        245,
        58,
        95,
        89
      ],
      "accounts": [
        {
          "name": "sellerTokenAccount",
          "writable": true
        },
        {
          "name": "seller",
          "writable": true,
          "signer": true,
          "relations": [
            "vaultAccount"
          ]
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "vaultAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "tokenWithdraw",
      "discriminator": [
        63,
        223,
        42,
        59,
        15,
        128,
        102,
        66
      ],
      "accounts": [
        {
          "name": "tokenAccountOwnerPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                  95,
                  111,
                  119,
                  110,
                  101,
                  114,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "vaultAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "sellerTokenAccount",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "upfrontPayment",
      "discriminator": [
        158,
        113,
        25,
        135,
        41,
        244,
        111,
        146
      ],
      "accounts": [
        {
          "name": "loanAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  108,
                  111,
                  97,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "borrower"
              }
            ]
          }
        },
        {
          "name": "tokenAccountOwnerPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                  95,
                  111,
                  119,
                  110,
                  101,
                  114,
                  95,
                  112,
                  100,
                  97
                ]
              }
            ]
          }
        },
        {
          "name": "borrowerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  98,
                  111,
                  114,
                  114,
                  111,
                  119,
                  101,
                  114,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "borrower"
              }
            ]
          }
        },
        {
          "name": "borrower",
          "writable": true,
          "signer": true
        },
        {
          "name": "sellerPaymentAccount",
          "writable": true
        },
        {
          "name": "borrowerPaymentAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  101,
                  109,
                  101,
                  111,
                  115,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "loanAccount",
      "discriminator": [
        223,
        49,
        62,
        167,
        247,
        182,
        239,
        60
      ]
    },
    {
      "name": "tokenAccountOwnerPda",
      "discriminator": [
        97,
        12,
        149,
        113,
        22,
        214,
        230,
        10
      ]
    },
    {
      "name": "vaultAccount",
      "discriminator": [
        230,
        251,
        241,
        83,
        139,
        202,
        93,
        28
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "overflow",
      "msg": "An overflow occurred."
    },
    {
      "code": 6001,
      "name": "invalidVaultTokenAccount",
      "msg": "The vault token account does not match the vault account."
    },
    {
      "code": 6002,
      "name": "tooLate",
      "msg": "The payment is too late."
    },
    {
      "code": 6003,
      "name": "tooEarly",
      "msg": "The payment is too early."
    },
    {
      "code": 6004,
      "name": "noRemainingPayments",
      "msg": "The loan is already fully paid."
    },
    {
      "code": 6005,
      "name": "impossibleToCloseLoan",
      "msg": "Impossible to close loan: the loan is still in progress."
    },
    {
      "code": 6006,
      "name": "impossibleToCloseVaultAccounts",
      "msg": "Impossible to vault accounts: the vault account still holds tokens that have already been promised."
    },
    {
      "code": 6007,
      "name": "wrongCurrency",
      "msg": "The payment currency is not the same as the one expected."
    },
    {
      "code": 6008,
      "name": "wrongReceiver",
      "msg": "The payment receiver is not the same as the one expected."
    },
    {
      "code": 6009,
      "name": "nemeosInstruction",
      "msg": "The instruction is not from Nemeos."
    },
    {
      "code": 6010,
      "name": "lotNotFound",
      "msg": "Impossible to create the loan (the lot id does not exist)."
    },
    {
      "code": 6011,
      "name": "loanNotFound",
      "msg": "Impossible to create the loan (the loan id does not exist)."
    },
    {
      "code": 6012,
      "name": "upfrontPaymentRequired",
      "msg": "The upfront payment is required to initialize the loan."
    },
    {
      "code": 6013,
      "name": "upfrontAlreadyPayed",
      "msg": "The upfront payment has already been payed."
    },
    {
      "code": 6014,
      "name": "notEnoughAvailableTokens",
      "msg": "Not enough available tokens."
    }
  ],
  "types": [
    {
      "name": "loanAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "borrower",
            "type": "pubkey"
          },
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "lotQuantity",
            "type": "u8"
          },
          {
            "name": "lotId",
            "type": "u8"
          },
          {
            "name": "loanId",
            "type": "u8"
          },
          {
            "name": "paymentAmount",
            "type": "u64"
          },
          {
            "name": "nbOfTokensPerPayment",
            "type": "u64"
          },
          {
            "name": "nbRemainingPayments",
            "type": "u8"
          },
          {
            "name": "periodDurationInSeconds",
            "type": "u64"
          },
          {
            "name": "startPeriod",
            "type": "u64"
          },
          {
            "name": "endPeriod",
            "type": "u64"
          },
          {
            "name": "upfrontAmount",
            "type": "u64"
          },
          {
            "name": "upfrontTokenQuantity",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokenAccountOwnerPda",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "vaultAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "availableTokens",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
