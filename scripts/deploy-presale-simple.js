const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH\n`);

  // Deploy Mock HypeAI Token
  console.log("📝 Deploying HypeAI Token...");
  const MockToken = await hre.ethers.getContractFactory("MockERC20");
  const hypeaiToken = await MockToken.deploy(
    "HypeAI Token",
    "HYPEAI",
    hre.ethers.parseEther("1000000000") // 1B tokens
  );
  await hypeaiToken.waitForDeployment();
  const hypeaiAddress = await hypeaiToken.getAddress();
  console.log(`✅ HypeAI Token: ${hypeaiAddress}\n`);

  // USDT mock address (doesn't need to exist for testing)
  const usdtAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";

  // Deploy PrivateSale
  console.log("📝 Deploying PrivateSale...");
  const latestBlock = await hre.ethers.provider.getBlock("latest");
  const saleStartTime = latestBlock.timestamp; // Use blockchain time
  const saleDuration = 30 * 24 * 60 * 60; // 30 days

  const PrivateSale = await hre.ethers.getContractFactory("HypeAIPrivateSale");
  const presale = await PrivateSale.deploy(
    hypeaiAddress,
    usdtAddress,
    saleStartTime,
    saleDuration
  );
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  console.log(`✅ PrivateSale: ${presaleAddress}\n`);

  // Transfer tokens to presale
  console.log("📝 Transferring tokens...");
  const tokensForSale = hre.ethers.parseEther("100000000"); // 100M
  await hypeaiToken.transfer(presaleAddress, tokensForSale);
  console.log("✅ Transferred 100M tokens\n");

  // Whitelist deployer
  console.log("📝 Adding to whitelist...");
  await presale.addToWhitelist([deployer.address]);
  console.log(`✅ Whitelisted: ${deployer.address}\n`);

  // Save deployment info
  const deploymentInfo = {
    network: "localhost",
    chainId: 31337,
    deployer: deployer.address,
    contracts: {
      hypeaiToken: hypeaiAddress,
      usdtToken: usdtAddress,
      privateSale: presaleAddress
    },
    deployedAt: new Date().toISOString()
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(deploymentsDir, "localhost.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Update frontend .env.local
  const frontendEnvPath = path.join(__dirname, "../src/frontend/.env.local");
  let envContent = fs.existsSync(frontendEnvPath)
    ? fs.readFileSync(frontendEnvPath, "utf8")
    : "";

  const updates = {
    "NEXT_PUBLIC_PRESALE_CONTRACT_ADDRESS": presaleAddress,
    "NEXT_PUBLIC_HYPEAI_TOKEN": hypeaiAddress,
    "NEXT_PUBLIC_BSC_RPC_URL": "http://localhost:8545",
    "NEXT_PUBLIC_CHAIN_ID": "31337"
  };

  for (const [key, value] of Object.entries(updates)) {
    if (envContent.includes(`${key}=`)) {
      envContent = envContent.replace(new RegExp(`${key}=.*`, "g"), `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}\n`;
    }
  }

  fs.writeFileSync(frontendEnvPath, envContent);
  console.log("✅ Updated frontend .env.local\n");

  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║         🎉 DEPLOYMENT SUCCESSFUL! 🎉             ║");
  console.log("╚══════════════════════════════════════════════════╝\n");
  console.log("📋 Contract Addresses:");
  console.log(`   HypeAI Token:  ${hypeaiAddress}`);
  console.log(`   PrivateSale:   ${presaleAddress}`);
  console.log(`\n✅ Next Steps:`);
  console.log("1. Restart frontend: cd src/frontend && npm run dev");
  console.log("2. Open: http://localhost:3001/presale");
  console.log("3. Import account to MetaMask:");
  console.log(`   Address: ${deployer.address}`);
  console.log(`   (Use Hardhat account #0 private key)\n`);

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
