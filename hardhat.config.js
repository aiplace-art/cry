import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: process.env.BSC_RPC_URL ? {
        url: process.env.BSC_RPC_URL,
        enabled: false
      } : undefined
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // BNB Chain Networks (Primary)
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66) ? [process.env.PRIVATE_KEY] : [],
      chainId: 97,
      gasPrice: 10000000000 // 10 gwei
    },
    bsc: {
      url: process.env.BSC_RPC_URL || "https://bsc-dataseed1.binance.org",
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66) ? [process.env.PRIVATE_KEY] : [],
      chainId: 56,
      gasPrice: 5000000000 // 5 gwei
    },
    // Ethereum Networks (Secondary)
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66) ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66) ? [process.env.PRIVATE_KEY] : [],
      chainId: 1
    }
  },
  paths: {
    sources: "./src/contracts",
    tests: "./tests/smart-contracts",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    outputFile: "gas-report.txt",
    noColors: true
  },
  etherscan: {
    apiKey: {
      // BNB Chain
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
      // Ethereum
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    }
  },
  mocha: {
    timeout: 40000
  }
};
