const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

console.log("🔐 Creating new test wallet for deployment...\n");

// Create random wallet
const wallet = ethers.Wallet.createRandom();

console.log("✅ Test wallet created!");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`📫 Address:     ${wallet.address}`);
console.log(`🔑 Private Key: ${wallet.privateKey}`);
console.log(`🌱 Mnemonic:    ${wallet.mnemonic.phrase}`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("⚠️  ВАЖНО: СОХРАНИТЕ ЭТУ ИНФОРМАЦИЮ!");
console.log("   Это ТЕСТОВЫЙ кошелек только для BSC Testnet");
console.log("   НЕ используйте его для mainnet или реальных средств!\n");

// Update .env file
const envPath = path.join(__dirname, "../.env");
let envContent = fs.readFileSync(envPath, "utf8");

// Replace PRIVATE_KEY
envContent = envContent.replace(
  /PRIVATE_KEY=.*/,
  `PRIVATE_KEY=${wallet.privateKey}`
);

fs.writeFileSync(envPath, envContent);
console.log("✅ Updated .env with new private key\n");

// Save wallet info
const walletInfo = {
  address: wallet.address,
  privateKey: wallet.privateKey,
  mnemonic: wallet.mnemonic.phrase,
  network: "BSC Testnet",
  createdAt: new Date().toISOString(),
  warning: "⚠️  TEST WALLET ONLY - Do not use for mainnet!"
};

const walletPath = path.join(__dirname, "../deployments/test-wallet.json");
fs.writeFileSync(walletPath, JSON.stringify(walletInfo, null, 2));
console.log(`💾 Wallet info saved: ${walletPath}\n`);

console.log("📋 Next Steps:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("1. Get testnet BNB from faucet:");
console.log(`   https://testnet.bnbchain.org/faucet-smart`);
console.log(`   \n   Your address: ${wallet.address}`);
console.log("\n2. Wait 1-2 minutes for BNB to arrive");
console.log("\n3. Run deployment:");
console.log("   npx hardhat run scripts/deploy-presale.js --network bscTestnet");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
