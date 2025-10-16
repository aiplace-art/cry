const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting PrivateSale deployment to BSC Testnet...\n");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (chainId: ${network.chainId})`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} BNB\n`);

  if (balance === 0n) {
    console.error("❌ ERROR: Deployer has no BNB for gas fees!");
    console.log("💡 Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart");
    process.exit(1);
  }

  // Deploy a simple mock token for testing (if needed)
  console.log("📝 Step 1: Deploying mock HypeAI token for testing...");
  const MockToken = await hre.ethers.getContractFactory("contracts/MockERC20.sol:MockERC20");

  let hypeaiToken;
  try {
    // Try to use existing token if available
    hypeaiToken = await MockToken.deploy("HypeAI Token", "HYPEAI", hre.ethers.parseEther("1000000000")); // 1B tokens
    await hypeaiToken.waitForDeployment();
    const hypeaiAddress = await hypeaiToken.getAddress();
    console.log(`✅ HypeAI Token deployed: ${hypeaiAddress}\n`);
  } catch (error) {
    console.log("⚠️  MockERC20 contract not found, creating it...\n");

    // Create MockERC20 contract
    const mockTokenCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}`;

    const mockTokenPath = path.join(__dirname, "../src/contracts/MockERC20.sol");
    fs.writeFileSync(mockTokenPath, mockTokenCode);
    console.log("✅ Created MockERC20.sol");

    // Recompile
    console.log("⚙️  Compiling...");
    await hre.run("compile");

    // Deploy again
    const MockTokenNew = await hre.ethers.getContractFactory("contracts/MockERC20.sol:MockERC20");
    hypeaiToken = await MockTokenNew.deploy("HypeAI Token", "HYPEAI", hre.ethers.parseEther("1000000000"));
    await hypeaiToken.waitForDeployment();
    const hypeaiAddress = await hypeaiToken.getAddress();
    console.log(`✅ HypeAI Token deployed: ${hypeaiAddress}\n`);
  }

  const hypeaiAddress = await hypeaiToken.getAddress();

  // USDT address on BSC Testnet (this is a mock address for testing)
  // Real BSC Mainnet USDT: 0x55d398326f99059fF775485246999027B3197955
  const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // BSC Testnet USDT

  console.log(`📝 Step 2: Deploying PrivateSale contract...`);
  console.log(`   HypeAI Token: ${hypeaiAddress}`);
  console.log(`   USDT Token: ${usdtAddress}`);

  // Sale parameters
  const saleStartTime = Math.floor(Date.now() / 1000); // Start now
  const saleDuration = 30 * 24 * 60 * 60; // 30 days

  console.log(`   Sale Start: ${new Date(saleStartTime * 1000).toISOString()}`);
  console.log(`   Sale End: ${new Date((saleStartTime + saleDuration) * 1000).toISOString()}\n`);

  // Deploy PrivateSale
  const PrivateSale = await hre.ethers.getContractFactory("HypeAIPrivateSale");
  const presale = await PrivateSale.deploy(
    hypeaiAddress,
    usdtAddress,
    saleStartTime,
    saleDuration
  );

  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();

  console.log(`✅ PrivateSale deployed: ${presaleAddress}\n`);

  // Transfer tokens to presale contract
  console.log("📝 Step 3: Transferring tokens to presale contract...");
  const tokensForSale = hre.ethers.parseEther("100000000"); // 100M tokens
  const transferTx = await hypeaiToken.transfer(presaleAddress, tokensForSale);
  await transferTx.wait();
  console.log(`✅ Transferred 100M HYPEAI tokens to presale\n`);

  // Add deployer to whitelist
  console.log("📝 Step 4: Adding deployer to whitelist...");
  const whitelistTx = await presale.addToWhitelist([deployer.address]);
  await whitelistTx.wait();
  console.log(`✅ Added ${deployer.address} to whitelist\n`);

  // Wait for confirmations
  console.log("⏳ Waiting for block confirmations...");
  await presale.deploymentTransaction().wait(3);
  console.log("✅ 3 confirmations received\n");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    contracts: {
      hypeaiToken: hypeaiAddress,
      usdtToken: usdtAddress,
      privateSale: presaleAddress
    },
    parameters: {
      saleStartTime,
      saleDuration,
      saleEndTime: saleStartTime + saleDuration,
      tokensForSale: tokensForSale.toString(),
      minPurchase: 40,
      maxPurchase: 800,
      hardCap: 80000,
      maxFoundingMembers: 500,
      tokenPrice: 0.0008,
      bonusPercentage: 10
    },
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    txHash: presale.deploymentTransaction().hash
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, "bscTestnet-presale.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved: ${deploymentFile}\n`);

  // Update frontend .env.local
  const frontendEnvPath = path.join(__dirname, "../src/frontend/.env.local");
  let envContent = fs.existsSync(frontendEnvPath)
    ? fs.readFileSync(frontendEnvPath, "utf8")
    : "";

  // Update or add contract address
  if (envContent.includes("NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS=")) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS=${presaleAddress}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS=${presaleAddress}\n`;
  }

  // Update HYPEAI token address
  if (envContent.includes("NEXT_PUBLIC_HYPEAI_TOKEN=")) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_HYPEAI_TOKEN=.*/,
      `NEXT_PUBLIC_HYPEAI_TOKEN=${hypeaiAddress}`
    );
  } else {
    envContent += `NEXT_PUBLIC_HYPEAI_TOKEN=${hypeaiAddress}\n`;
  }

  fs.writeFileSync(frontendEnvPath, envContent);
  console.log(`✅ Updated frontend .env.local\n`);

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║                 🎉 DEPLOYMENT SUCCESSFUL! 🎉             ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  console.log("📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🌐 Network:          ${network.name}`);
  console.log(`🔗 Chain ID:         ${network.chainId}`);
  console.log(`👤 Deployer:         ${deployer.address}`);
  console.log(`\n💎 Contracts:`);
  console.log(`   HypeAI Token:     ${hypeaiAddress}`);
  console.log(`   Private Sale:     ${presaleAddress}`);
  console.log(`   USDT:             ${usdtAddress}`);
  console.log(`\n📊 Sale Parameters:`);
  console.log(`   Token Price:      $0.0008`);
  console.log(`   Min Purchase:     $40`);
  console.log(`   Max Purchase:     $800`);
  console.log(`   Hard Cap:         $80,000`);
  console.log(`   Bonus:            10%`);
  console.log(`   Max Members:      500`);
  console.log(`\n🔗 Transaction:      ${presale.deploymentTransaction().hash}`);
  console.log(`📱 BscScan:          https://testnet.bscscan.com/address/${presaleAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✅ Next Steps:");
  console.log("1. Restart frontend dev server: cd src/frontend && npm run dev");
  console.log("2. Open: http://localhost:3001/presale");
  console.log("3. Connect MetaMask to BSC Testnet");
  console.log("4. Your address is whitelisted, you can test purchases!");
  console.log("\n💡 Get testnet BNB: https://testnet.bnbchain.org/faucet-smart");
  console.log("\n🎯 Ready to test the presale!\n");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
