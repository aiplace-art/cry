const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("=".repeat(60));
  console.log("📍 Deployer Address:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "BNB");
  console.log("=".repeat(60));

  if (balance === 0n) {
    console.log("\n⚠️  Balance is 0. You need to get testnet BNB from faucet:");
    console.log("🔗 https://testnet.bnbchain.org/faucet-smart");
    console.log("🔗 https://testnet.binance.org/faucet-smart");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
