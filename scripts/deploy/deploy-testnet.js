const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting testnet deployment...");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Deploying to network: ${network.name} (chainId: ${network.chainId})`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH`);

  // Deploy Token contract
  console.log("\nDeploying HypedToken contract...");
  const Token = await hre.ethers.getContractFactory("HypedToken");

  // Constructor parameters
  const initialSupply = hre.ethers.parseEther("1000000000"); // 1 billion tokens
  const taxRate = 5; // 5% tax
  const reflectionRate = 2; // 2% reflection
  const burnRate = 1; // 1% burn

  const token = await Token.deploy(
    initialSupply,
    taxRate,
    reflectionRate,
    burnRate
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log(`HypedToken deployed to: ${tokenAddress}`);

  // Wait for a few block confirmations
  console.log("\nWaiting for block confirmations...");
  await token.deploymentTransaction().wait(5);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    address: tokenAddress,
    constructorArgs: [initialSupply.toString(), taxRate, reflectionRate, burnRate],
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    txHash: token.deploymentTransaction().hash
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment details
  const networkName = network.name === "unknown" ? `chain-${network.chainId}` : network.name;
  const deploymentFile = path.join(deploymentsDir, `${networkName}-latest.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);

  // Also save with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const timestampedFile = path.join(deploymentsDir, `${networkName}-${timestamp}.json`);
  fs.writeFileSync(timestampedFile, JSON.stringify(deploymentInfo, null, 2));

  // Update contract addresses for frontend
  const addressesFile = path.join(__dirname, "../../src/config/contract-addresses.json");
  let addresses = {};
  if (fs.existsSync(addressesFile)) {
    addresses = JSON.parse(fs.readFileSync(addressesFile, "utf8"));
  }
  addresses[network.chainId] = {
    HypedToken: tokenAddress,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}`);
  console.log(`Contract: ${tokenAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Transaction: ${token.deploymentTransaction().hash}`);
  console.log("==========================\n");

  // Verify on Etherscan/Polygonscan if not localhost
  if (network.chainId !== 31337 && network.chainId !== 1337) {
    console.log("To verify the contract, run:");
    console.log(`npx hardhat verify --network ${network.name} ${tokenAddress} ${initialSupply.toString()} ${taxRate} ${reflectionRate} ${burnRate}`);
  }

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
