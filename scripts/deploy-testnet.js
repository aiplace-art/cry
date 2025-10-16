const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("\n" + "=".repeat(70));
  console.log("🚀 DEPLOYING TO BSC TESTNET");
  console.log("=".repeat(70));
  console.log("📍 Deployer Address:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "BNB");
  console.log("🌐 Network:", (await hre.ethers.provider.getNetwork()).name, "- Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  console.log("=".repeat(70) + "\n");

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  if (balance === 0n) {
    throw new Error("❌ Insufficient balance! Get testnet BNB from faucet first.");
  }

  // Deploy HypeAI Token
  console.log("📦 [1/2] Deploying HypeAI Token...");
  const HypeAIToken = await hre.ethers.getContractFactory("HypeAIToken");
  const hypeaiToken = await HypeAIToken.deploy(
    "HypeAI Token",
    "HYPEAI",
    hre.ethers.parseUnits("1000000000", 18) // 1 billion tokens
  );
  await hypeaiToken.waitForDeployment();
  const hypeaiAddress = await hypeaiToken.getAddress();
  console.log("✅ HypeAI Token deployed to:", hypeaiAddress);

  // Wait for 3 confirmations
  console.log("⏳ Waiting for confirmations...");
  await hypeaiToken.deploymentTransaction().wait(3);

  // Deploy Presale Contract
  console.log("\n📦 [2/2] Deploying Presale Contract...");

  // BSC Testnet USDT: 0x337610d27c682E347C9cD60BD4b3b107C9d34dDd (or deploy mock)
  const USDT_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
  const SALE_START = Math.floor(Date.now() / 1000) + 60; // Starts in 1 minute
  const SALE_DURATION = 30 * 24 * 60 * 60; // 30 days

  const PrivateSale = await hre.ethers.getContractFactory("HypeAIPrivateSale");
  const presale = await PrivateSale.deploy(
    hypeaiAddress,
    USDT_ADDRESS,
    SALE_START,
    SALE_DURATION
  );
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  console.log("✅ Presale Contract deployed to:", presaleAddress);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await presale.deploymentTransaction().wait(3);

  // Transfer tokens to presale contract
  console.log("\n💸 Transferring tokens to presale contract...");
  const tokensForSale = hre.ethers.parseUnits("100000000", 18); // 100M tokens
  const transferTx = await hypeaiToken.transfer(presaleAddress, tokensForSale);
  await transferTx.wait();
  console.log("✅ Transferred", hre.ethers.formatUnits(tokensForSale, 18), "HYPEAI tokens");

  // Add deployer to whitelist
  console.log("\n📋 Adding deployer to whitelist...");
  const whitelistTx = await presale.addToWhitelist([deployer.address]);
  await whitelistTx.wait();
  console.log("✅ Deployer added to whitelist");

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(70));
  console.log("📄 HypeAI Token:", hypeaiAddress);
  console.log("📄 Presale Contract:", presaleAddress);
  console.log("📄 USDT Address:", USDT_ADDRESS);
  console.log("⏰ Sale Start:", new Date(SALE_START * 1000).toLocaleString());
  console.log("⏰ Sale End:", new Date((SALE_START + SALE_DURATION) * 1000).toLocaleString());
  console.log("=".repeat(70));

  // Save to .env.testnet
  const fs = require('fs');
  const envContent = `
# BSC Testnet Deployment
NEXT_PUBLIC_PRESALE_CONTRACT=${presaleAddress}
NEXT_PUBLIC_HYPEAI_TOKEN=${hypeaiAddress}
NEXT_PUBLIC_USDT_TOKEN=${USDT_ADDRESS}
NEXT_PUBLIC_BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_NETWORK_NAME=BSC Testnet
`;

  fs.writeFileSync('./src/frontend/.env.testnet', envContent.trim());
  console.log("\n💾 Config saved to: ./src/frontend/.env.testnet");
  console.log("\n📝 Next steps:");
  console.log("   1. Copy .env.testnet to .env.local in frontend");
  console.log("   2. Restart frontend dev server");
  console.log("   3. Connect MetaMask to BSC Testnet");
  console.log("   4. Test purchase flow!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
