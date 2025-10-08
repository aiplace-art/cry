const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting HypedToken deployment...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // Configuration
  const TREASURY_WALLET = process.env.TREASURY_WALLET || deployer.address;
  const LIQUIDITY_WALLET = process.env.LIQUIDITY_WALLET || deployer.address;

  console.log("⚙️  Configuration:");
  console.log("   Treasury Wallet:", TREASURY_WALLET);
  console.log("   Liquidity Wallet:", LIQUIDITY_WALLET);
  console.log("");

  // Deploy HypedToken
  console.log("📦 Deploying HypedToken contract...");
  const HypedToken = await hre.ethers.getContractFactory("HypedToken");
  const token = await HypedToken.deploy(TREASURY_WALLET, LIQUIDITY_WALLET);

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("✅ HypedToken deployed to:", tokenAddress);
  console.log("");

  // Display token information
  console.log("📊 Token Information:");
  console.log("   Name:", await token.name());
  console.log("   Symbol:", await token.symbol());
  console.log("   Total Supply:", hre.ethers.formatEther(await token.totalSupply()), "HYPE");
  console.log("   Decimals:", await token.decimals());
  console.log("");

  console.log("💼 Tokenomics:");
  console.log("   Max Transaction:", hre.ethers.formatEther(await token.maxTransactionAmount()), "HYPE (0.5%)");
  console.log("   Max Wallet:", hre.ethers.formatEther(await token.maxWalletAmount()), "HYPE (2%)");
  console.log("");

  console.log("💸 Fee Structure:");
  console.log("   Reflection Fee:", (await token.reflectionFee()).toString() / 100, "%");
  console.log("   Liquidity Fee:", (await token.liquidityFee()).toString() / 100, "%");
  console.log("   Burn Fee:", (await token.burnFee()).toString() / 100, "%");
  console.log("   Treasury Fee:", (await token.treasuryFee()).toString() / 100, "%");
  console.log("   Total Fees:", (await token.totalFees()).toString() / 100, "%");
  console.log("");

  console.log("🏆 Staking APY:");
  console.log("   30 Days: 17% APY (12% base + 5% bonus)");
  console.log("   90 Days: 27% APY (12% base + 15% bonus)");
  console.log("   365 Days: 62% APY (12% base + 50% bonus)");
  console.log("");

  // Initial setup (optional)
  console.log("🔧 Initial Setup:");

  // Uncomment to enable trading immediately
  // console.log("   Enabling trading...");
  // await token.enableTrading();
  // console.log("   ✅ Trading enabled");

  console.log("   ⚠️  Trading NOT enabled - run enableTrading() manually");
  console.log("");

  // Verification instructions
  console.log("🔍 Verification:");
  console.log("   To verify on Etherscan/BSCScan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${tokenAddress} "${TREASURY_WALLET}" "${LIQUIDITY_WALLET}"`);
  console.log("");

  // Summary
  console.log("📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Address:", tokenAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Treasury:", TREASURY_WALLET);
  console.log("Liquidity:", LIQUIDITY_WALLET);
  console.log("Block Number:", await hre.ethers.provider.getBlockNumber());
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: tokenAddress,
    deployer: deployer.address,
    treasuryWallet: TREASURY_WALLET,
    liquidityWallet: LIQUIDITY_WALLET,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const deploymentsDir = './deployments';
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}-deployment.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to:", `deployments/${hre.network.name}-deployment.json`);
  console.log("");

  console.log("✨ Deployment complete!");
  console.log("");

  // Next steps
  console.log("📝 Next Steps:");
  console.log("   1. Verify contract on block explorer");
  console.log("   2. Enable trading: token.enableTrading()");
  console.log("   3. Add initial liquidity to DEX");
  console.log("   4. Set up AMM pair: token.setAutomatedMarketMakerPair()");
  console.log("   5. Configure marketing campaigns");
  console.log("   6. Launch community airdrop");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
