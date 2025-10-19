const hre = require("hardhat");

async function main() {
  console.log("\n🔍 Checking BSC Mainnet Balance...\n");

  try {
    const [deployer] = await hre.ethers.getSigners();

    console.log("📍 Deployer Address:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceBNB = hre.ethers.formatEther(balance);

    console.log("💰 Balance:", balanceBNB, "BNB");
    console.log("");

    // Check if enough for deployment
    const minRequired = 0.05;
    if (parseFloat(balanceBNB) >= minRequired) {
      console.log("✅ Sufficient balance for deployment!");
      console.log(`   Required: ${minRequired} BNB`);
      console.log(`   You have: ${balanceBNB} BNB`);
      console.log("");
      console.log("🚀 Ready to deploy to BSC Mainnet!");
    } else {
      console.log("❌ Insufficient balance for deployment");
      console.log(`   Required: ${minRequired} BNB`);
      console.log(`   You have: ${balanceBNB} BNB`);
      console.log(`   Need: ${(minRequired - parseFloat(balanceBNB)).toFixed(4)} more BNB`);
      console.log("");
      console.log("💡 You need to buy BNB to deploy to mainnet.");
    }

    // Get current network
    const network = await hre.ethers.provider.getNetwork();
    console.log("\n📊 Network Info:");
    console.log("   Name:", network.name);
    console.log("   Chain ID:", network.chainId.toString());

    if (network.chainId !== 56n) {
      console.log("\n⚠️  WARNING: Not connected to BSC Mainnet!");
      console.log("   Expected Chain ID: 56");
      console.log("   Current Chain ID:", network.chainId.toString());
    }

  } catch (error) {
    console.error("\n❌ Error checking balance:");
    console.error(error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
