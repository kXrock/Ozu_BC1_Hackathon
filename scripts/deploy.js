const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // EntryPoint deploy
  const EntryPoint = await hre.ethers.getContractFactory("EntryPoint");
  const entryPoint = await EntryPoint.deploy();
  await entryPoint.waitForDeployment();
  console.log("EntryPoint deployed to:", await entryPoint.getAddress());

  // InheritanceWallet deploy
  const InheritanceWallet = await hre.ethers.getContractFactory("InheritanceWallet");
  const inheritanceWallet = await InheritanceWallet.deploy(
    deployer.address,  // owner adresi
    86400,            // 1 gün (saniye cinsinden)
    await entryPoint.getAddress()
  );
  await inheritanceWallet.waitForDeployment();
  console.log("InheritanceWallet deployed to:", await inheritanceWallet.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 