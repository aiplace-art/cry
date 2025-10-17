const hre = require("hardhat");

async function main() {
  console.log("\n🚀 DEPLOYING HYPEAI TOKENOMICS TO BSC TESTNET\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Addresses for BSC Testnet
  const TREASURY_WALLET = deployer.address; // Replace with actual treasury
  const LIQUIDITY_WALLET = deployer.address; // Replace with actual liquidity
  const USDT_TESTNET = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet USDT
  const CHAINLINK_BNB_USD_TESTNET = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526";

  console.log("\n📋 Deployment Configuration:");
  console.log("- Treasury:", TREASURY_WALLET);
  console.log("- Liquidity:", LIQUIDITY_WALLET);
  console.log("- USDT:", USDT_TESTNET);
  console.log("- Chainlink BNB/USD:", CHAINLINK_BNB_USD_TESTNET);

  // 1. Deploy Token
  console.log("\n1️⃣ Deploying HypeAI Token...");
  const Token = await hre.ethers.getContractFactory("HypeAI");
  const token = await Token.deploy(TREASURY_WALLET, LIQUIDITY_WALLET);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ Token deployed to:", tokenAddress);

  // 2. Deploy TeamTokenVesting
  console.log("\n2️⃣ Deploying Team Token Vesting...");
  const Vesting = await hre.ethers.getContractFactory("TeamTokenVesting");
  const vesting = await Vesting.deploy(tokenAddress);
  await vesting.waitForDeployment();
  const vestingAddress = await vesting.getAddress();
  console.log("✅ Vesting deployed to:", vestingAddress);

  // 3. Deploy PrivateSale with Chainlink
  console.log("\n3️⃣ Deploying Private Sale (with Chainlink Oracle)...");
  const saleStartTime = Math.floor(Date.now() / 1000); // Start now
  const saleDuration = 30 * 24 * 60 * 60; // 30 days

  const PrivateSale = await hre.ethers.getContractFactory("HypeAIPrivateSale");
  const privateSale = await PrivateSale.deploy(
    tokenAddress,
    USDT_TESTNET,
    CHAINLINK_BNB_USD_TESTNET,
    saleStartTime,
    saleDuration
  );
  await privateSale.waitForDeployment();
  const privateSaleAddress = await privateSale.getAddress();
  console.log("✅ Private Sale deployed to:", privateSaleAddress);

  // Transfer tokens to contracts
  console.log("\n4️⃣ Transferring tokens to contracts...");
  
  // Transfer 1.1B to Private Sale
  const privateSaleAmount = hre.ethers.parseEther("1100000000"); // 1.1B
  await token.transfer(privateSaleAddress, privateSaleAmount);
  console.log("✅ Transferred 1.1B HYPE to Private Sale");

  // Transfer 1B to Vesting
  const vestingAmount = hre.ethers.parseEther("1000000000"); // 1B
  await token.transfer(vestingAddress, vestingAmount);
  console.log("✅ Transferred 1B HYPE to Vesting");

  // Enable trading
  console.log("\n5️⃣ Enabling trading...");
  await token.enableTrading();
  console.log("✅ Trading enabled");

  // Verify pool health
  console.log("\n6️⃣ Checking staking pool health...");
  const poolHealth = await token.getPoolHealth();
  console.log("Pool remaining:", hre.ethers.formatEther(poolHealth[0]), "HYPE");
  console.log("Pool health:", poolHealth[1].toString() + "%");
  console.log("Current APY 365d:", (poolHealth[4] / 100).toString() + "%");

  // Get BNB price from Chainlink
  console.log("\n7️⃣ Testing Chainlink Oracle...");
  try {
    const bnbPrice = await privateSale.getBNBPrice();
    console.log("✅ Current BNB price:", "$" + bnbPrice.toString());
  } catch (error) {
    console.log("⚠️ Chainlink oracle error:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 CONTRACT ADDRESSES:");
  console.log("Token:        ", tokenAddress);
  console.log("Vesting:      ", vestingAddress);
  console.log("Private Sale: ", privateSaleAddress);
  console.log("\n📊 BALANCES:");
  console.log("Private Sale: ", hre.ethers.formatEther(await token.balanceOf(privateSaleAddress)), "HYPE");
  console.log("Vesting:      ", hre.ethers.formatEther(await token.balanceOf(vestingAddress)), "HYPE");
  console.log("Owner:        ", hre.ethers.formatEther(await token.balanceOf(deployer.address)), "HYPE");

  console.log("\n🔗 VERIFY COMMANDS:");
  console.log("npx hardhat verify --network bscTestnet", tokenAddress, TREASURY_WALLET, LIQUIDITY_WALLET);
  console.log("npx hardhat verify --network bscTestnet", vestingAddress, tokenAddress);
  console.log("npx hardhat verify --network bscTestnet", privateSaleAddress, tokenAddress, USDT_TESTNET, CHAINLINK_BNB_USD_TESTNET, saleStartTime, saleDuration);

  console.log("\n💾 Saving deployment info...");
  const fs = require("fs");
  const deployment = {
    network: "bscTestnet",
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      token: tokenAddress,
      vesting: vestingAddress,
      privateSale: privateSaleAddress
    },
    poolHealth: {
      remaining: hre.ethers.formatEther(poolHealth[0]),
      healthPercent: poolHealth[1].toString(),
      apy365d: (poolHealth[4] / 100).toString()
    }
  };
  
  fs.writeFileSync(
    "deployment-testnet.json",
    JSON.stringify(deployment, null, 2)
  );
  console.log("✅ Deployment info saved to deployment-testnet.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
