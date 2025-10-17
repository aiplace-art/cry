require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            viaIR: true, // Enable IR-based code generation for better optimization
        },
    },
    networks: {
        // Local development
        hardhat: {
            chainId: 31337,
            mining: {
                auto: true,
                interval: 0,
            },
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },

        // Ethereum networks
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 11155111,
            gasPrice: "auto",
        },
        mainnet: {
            url: process.env.MAINNET_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 1,
            gasPrice: "auto",
        },

        // BSC networks
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 97,
            gasPrice: 10000000000, // 10 gwei
        },
        bsc: {
            url: "https://bsc-dataseed.binance.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 56,
            gasPrice: "auto",
        },

        // Polygon networks
        mumbai: {
            url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 80001,
            gasPrice: "auto",
        },
        polygon: {
            url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 137,
            gasPrice: "auto",
        },

        // Arbitrum networks
        arbitrumSepolia: {
            url: "https://sepolia-rollup.arbitrum.io/rpc",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 421614,
        },
        arbitrum: {
            url: "https://arb1.arbitrum.io/rpc",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 42161,
        },

        // Optimism networks
        optimismSepolia: {
            url: "https://sepolia.optimism.io",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 11155420,
        },
        optimism: {
            url: "https://mainnet.optimism.io",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 10,
        },
    },

    // Etherscan API keys for contract verification
    etherscan: {
        apiKey: {
            mainnet: process.env.ETHERSCAN_API_KEY || "",
            sepolia: process.env.ETHERSCAN_API_KEY || "",
            bsc: process.env.BSCSCAN_API_KEY || "",
            bscTestnet: process.env.BSCSCAN_API_KEY || "",
            polygon: process.env.POLYGONSCAN_API_KEY || "",
            polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
            arbitrumOne: process.env.ARBISCAN_API_KEY || "",
            arbitrumSepolia: process.env.ARBISCAN_API_KEY || "",
            optimisticEthereum: process.env.OPTIMISTIC_ETHERSCAN_API_KEY || "",
            optimisticSepolia: process.env.OPTIMISTIC_ETHERSCAN_API_KEY || "",
        },
    },

    // Gas reporter configuration
    gasReporter: {
        enabled: process.env.REPORT_GAS === "true",
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
        outputFile: "gas-report.txt",
        noColors: true,
        token: "ETH", // Can be changed to BNB, MATIC, etc.
    },

    // Coverage configuration
    coverage: {
        skipFiles: ["test/", "mock/"],
    },

    // Path configuration
    paths: {
        sources: "./src/contracts",
        tests: "./tests",
        cache: "./cache",
        artifacts: "./artifacts",
    },

    // Mocha timeout for tests
    mocha: {
        timeout: 200000, // 200 seconds
    },
};
