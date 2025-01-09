const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Tracking contract...");

  // Get the signer
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Deploy the contract
  const Tracking = await ethers.getContractFactory("Tracking");
  const tracking = await Tracking.deploy();
  await tracking.deployed();

  console.log("Tracking contract deployed at:", tracking.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
