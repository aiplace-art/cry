const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? `chain-${network.chainId}` : network.name;

  console.log(`Verifying contract on ${networkName}...`);

  // Read deployment info
  const deploymentFile = path.join(__dirname, "../../deployments", `${networkName}-latest.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`Deployment file not found: ${deploymentFile}`);
    console.error("Please deploy the contract first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  console.log(`Contract address: ${deployment.address}`);
  console.log("Constructor arguments:", deployment.constructorArgs);

  try {
    // Verify the contract
    await hre.run("verify:verify", {
      address: deployment.address,
      constructorArguments: deployment.constructorArgs,
    });

    console.log(`✅ Contract verified successfully!`);

    // Determine the explorer URL
    let explorerUrl = "";
    switch (network.chainId) {
      case 1: // Mainnet
        explorerUrl = `https://etherscan.io/address/${deployment.address}`;
        break;
      case 5: // Goerli
        explorerUrl = `https://goerli.etherscan.io/address/${deployment.address}`;
        break;
      case 11155111: // Sepolia
        explorerUrl = `https://sepolia.etherscan.io/address/${deployment.address}`;
        break;
      case 137: // Polygon
        explorerUrl = `https://polygonscan.com/address/${deployment.address}`;
        break;
      case 80001: // Mumbai
        explorerUrl = `https://mumbai.polygonscan.com/address/${deployment.address}`;
        break;
      case 56: // BSC
        explorerUrl = `https://bscscan.com/address/${deployment.address}`;
        break;
      case 97: // BSC Testnet
        explorerUrl = `https://testnet.bscscan.com/address/${deployment.address}`;
        break;
      default:
        console.log("Unknown network - no explorer URL available");
    }

    if (explorerUrl) {
      console.log(`View on explorer: ${explorerUrl}`);
    }

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("Verification failed:", error.message);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
