/**
 * Encode Constructor Arguments for HypeAIPrivateSaleWithVesting
 *
 * This script generates the ABI-encoded constructor arguments
 * needed for manual contract verification on BSCScan.
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Encoding Constructor Arguments\n");

  // Constructor parameters from deployment
  const hypeToken = "0x02B23B891b3A3717673291aD34EB67893A19D978";
  const usdtToken = "0x284D311f0E4562a3a870720D97aa12c445922137";
  const referralSystem = "0x0000000000000000000000000000000000000000"; // NULL address

  console.log("📦 Constructor Parameters:");
  console.log(`  _hypeToken:      ${hypeToken}`);
  console.log(`  _usdtToken:      ${usdtToken}`);
  console.log(`  _referralSystem: ${referralSystem}`);
  console.log("");

  // Encode arguments
  const abiCoder = new ethers.AbiCoder();
  const encoded = abiCoder.encode(
    ["address", "address", "address"],
    [hypeToken, usdtToken, referralSystem]
  );

  console.log("✅ ABI-Encoded Constructor Arguments:");
  console.log("");
  console.log(encoded.slice(2)); // Remove '0x' prefix
  console.log("");

  // Also show individual argument encoding (for debugging)
  console.log("📋 Individual Argument Encoding:");
  console.log(`  _hypeToken:      ${abiCoder.encode(["address"], [hypeToken]).slice(2)}`);
  console.log(`  _usdtToken:      ${abiCoder.encode(["address"], [usdtToken]).slice(2)}`);
  console.log(`  _referralSystem: ${abiCoder.encode(["address"], [referralSystem]).slice(2)}`);
  console.log("");

  // Verification command
  console.log("🚀 Full Verification Command:");
  console.log("");
  console.log("npx hardhat verify --network bscTestnet \\");
  console.log("  0x01708a6b5818fD3c98f4a947349E3D58DD8B39D3 \\");
  console.log(`  "${hypeToken}" \\`);
  console.log(`  "${usdtToken}" \\`);
  console.log(`  "${referralSystem}"`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
