const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("\n" + "=".repeat(70));
  console.log("🚀 DEPLOYING HYPEAI TO BSC TESTNET");
  console.log("=".repeat(70));
  console.log("📍 Deployer Address:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "BNB");
  console.log("🌐 Network:", (await hre.ethers.provider.getNetwork()).name, "- Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log("=".repeat(70) + "\n");

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  if (balance < hre.ethers.parseEther("0.03")) {
    console.log("❌ Insufficient BNB balance!");
    console.log("📍 Get BNB from: https://testnet.bnbchain.org/faucet-smart");
    console.log("💰 Need at least: 0.03 BNB");
    throw new Error("Insufficient balance");
  }

  // Treasury and Liquidity addresses (same as deployer for testnet)
  const treasury = deployer.address;
  const liquidity = deployer.address;

  // ========================================
  // 1. Deploy HypeAI Token (10B supply)
  // ========================================
  console.log("📦 [1/4] Deploying HypeAI Token (10B supply)...");
  const Token = await hre.ethers.getContractFactory("HypeAI");
  const token = await Token.deploy(treasury, liquidity);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ HypeAI Token deployed to:", tokenAddress);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await token.deploymentTransaction().wait(3);

  // Enable trading
  console.log("🔓 Enabling trading...");
  const enableTx = await token.enableTrading();
  await enableTx.wait();
  console.log("✅ Trading enabled\n");

  // ========================================
  // 2. Deploy TeamTokenVesting
  // ========================================
  console.log("📦 [2/4] Deploying TeamTokenVesting (6m cliff + 24m vesting)...");
  const Vesting = await hre.ethers.getContractFactory("TeamTokenVesting");
  const vesting = await Vesting.deploy(tokenAddress);
  await vesting.waitForDeployment();
  const vestingAddress = await vesting.getAddress();
  console.log("✅ TeamTokenVesting deployed to:", vestingAddress);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await vesting.deploymentTransaction().wait(3);

  // Exclude vesting from limits
  console.log("⚙️  Excluding vesting contract from limits...");
  const excludeTx = await token.excludeFromLimits(vestingAddress, true);
  await excludeTx.wait();
  console.log("✅ Vesting contract excluded from limits");

  // Transfer team tokens (1B)
  console.log("💰 Transferring team tokens to vesting contract...");
  const teamAllocation = hre.ethers.parseEther("1000000000"); // 1B
  const vestingTransferTx = await token.transfer(vestingAddress, teamAllocation);
  await vestingTransferTx.wait();
  console.log("✅ Transferred 1,000,000,000 HYPE to vesting\n");

  // ========================================
  // 3. Deploy Mock USDT
  // ========================================
  console.log("📦 [3/4] Deploying Mock USDT for testnet...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mockUsdt = await MockERC20.deploy(
    "Mock USDT",
    "USDT",
    hre.ethers.parseEther("1000000") // 1M USDT
  );
  await mockUsdt.waitForDeployment();
  const usdtAddress = await mockUsdt.getAddress();
  console.log("✅ Mock USDT deployed to:", usdtAddress);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await mockUsdt.deploymentTransaction().wait(3);
  console.log("");

  // ========================================
  // 4. Deploy HypeAIPrivateSale with Chainlink
  // ========================================

  // BSC Testnet Chainlink BNB/USD Price Feed
  const BNB_USD_PRICE_FEED = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";

  const SALE_START = Math.floor(Date.now() / 1000); // Now
  const SALE_DURATION = 30 * 24 * 60 * 60; // 30 days

  console.log("📦 [4/4] Deploying HypeAIPrivateSale with Chainlink oracle...");
  const PrivateSale = await hre.ethers.getContractFactory("HypeAIPrivateSale");
  const privateSale = await PrivateSale.deploy(
    tokenAddress,
    usdtAddress,
    BNB_USD_PRICE_FEED,
    SALE_START,
    SALE_DURATION
  );
  await privateSale.waitForDeployment();
  const privateSaleAddress = await privateSale.getAddress();
  console.log("✅ HypeAIPrivateSale deployed to:", privateSaleAddress);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await privateSale.deploymentTransaction().wait(3);

  // Transfer sale tokens (1.1B)
  console.log("💰 Transferring tokens to private sale contract...");
  const saleAllocation = hre.ethers.parseEther("1100000000"); // 1.1B
  const saleTransferTx = await token.transfer(privateSaleAddress, saleAllocation);
  await saleTransferTx.wait();
  console.log("✅ Transferred 1,100,000,000 HYPE to private sale");

  // Add deployer to whitelist
  console.log("📋 Adding deployer to whitelist...");
  const whitelistTx = await privateSale.addToWhitelist([deployer.address]);
  await whitelistTx.wait();
  console.log("✅ Deployer added to whitelist\n");

  // ========================================
  // Summary
  // ========================================
  console.log("=".repeat(70));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(70));
  console.log("📄 HypeAI Token:        ", tokenAddress);
  console.log("📄 TeamTokenVesting:    ", vestingAddress);
  console.log("📄 HypeAIPrivateSale:   ", privateSaleAddress);
  console.log("📄 Mock USDT:           ", usdtAddress);
  console.log("🔗 Chainlink BNB/USD:   ", BNB_USD_PRICE_FEED);
  console.log("=".repeat(70));
  console.log("⏰ Sale Start:", new Date(SALE_START * 1000).toLocaleString());
  console.log("⏰ Sale End:", new Date((SALE_START + SALE_DURATION) * 1000).toLocaleString());
  console.log("=".repeat(70) + "\n");

  // Save deployment info
  const deploymentInfo = {
    network: "BSC Testnet",
    chainId: 97,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      HypeAI: tokenAddress,
      TeamTokenVesting: vestingAddress,
      HypeAIPrivateSale: privateSaleAddress,
      MockUSDT: usdtAddress,
      ChainlinkBNBUSD: BNB_USD_PRICE_FEED
    },
    verification: {
      HypeAI: `npx hardhat verify --network bscTestnet ${tokenAddress} "${treasury}" "${liquidity}"`,
      TeamTokenVesting: `npx hardhat verify --network bscTestnet ${vestingAddress} "${tokenAddress}"`,
      HypeAIPrivateSale: `npx hardhat verify --network bscTestnet ${privateSaleAddress} "${tokenAddress}" "${usdtAddress}" "${BNB_USD_PRICE_FEED}" ${SALE_START} ${SALE_DURATION}`,
      MockUSDT: `npx hardhat verify --network bscTestnet ${usdtAddress} "Mock USDT" "USDT" "1000000000000000000000000"`
    }
  };

  fs.writeFileSync('deployment-testnet.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to: deployment-testnet.json\n");

  // Save to frontend .env
  const envContent = `# BSC Testnet Deployment - ${new Date().toISOString()}
NEXT_PUBLIC_HYPEAI_TOKEN=${tokenAddress}
NEXT_PUBLIC_VESTING_CONTRACT=${vestingAddress}
NEXT_PUBLIC_PRESALE_CONTRACT=${privateSaleAddress}
NEXT_PUBLIC_USDT_TOKEN=${usdtAddress}
NEXT_PUBLIC_BNB_PRICE_FEED=${BNB_USD_PRICE_FEED}
NEXT_PUBLIC_BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_NETWORK_NAME=BSC Testnet
`;

  fs.writeFileSync('./src/frontend/.env.testnet', envContent);
  console.log("💾 Frontend config saved to: ./src/frontend/.env.testnet\n");

  console.log("📝 Next steps:");
  console.log("   1. Verify contracts: bash scripts/verify-testnet.sh");
  console.log("   2. View on BSCScan: https://testnet.bscscan.com/address/" + tokenAddress);
  console.log("   3. Test manually (see docs/BSC_TESTNET_DEPLOYMENT_GUIDE.md)");
  console.log("   4. Share with community for testing\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
