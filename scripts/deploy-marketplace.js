const hre = require("hardhat");

async function main() {
  try {
    // Get the deployer
    const [deployer] = await hre.ethers.getSigners();
    
    // Deploy PokemonNFT first
    console.log("Deploying PokemonNFT...");
    const PokemonNFT = await hre.ethers.getContractFactory("PokemonNFT");
    const nftProxy = await hre.upgrades.deployProxy(
      PokemonNFT,
      [deployer.address],
      { kind: 'uups', initializer: 'initialize' }
    );
    await nftProxy.waitForDeployment();
    const nftAddress = await nftProxy.getAddress();
    console.log("PokemonNFT deployed to:", nftAddress);

    // Deploy Marketplace
    console.log("Deploying PokemonMarketplace...");
    const PokemonMarketplace = await hre.ethers.getContractFactory("PokemonMarketplace");
    const marketProxy = await hre.upgrades.deployProxy(
      PokemonMarketplace,
      [deployer.address, nftAddress],
      { kind: 'uups', initializer: 'initialize' }
    );
    await marketProxy.waitForDeployment();
    const marketAddress = await marketProxy.getAddress();
    console.log("PokemonMarketplace deployed to:", marketAddress);

    // Wait and verify
    console.log("Waiting for deployments to be confirmed...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Verify NFT implementation
    const nftImplementation = await hre.upgrades.erc1967.getImplementationAddress(nftAddress);
    console.log("Verifying NFT implementation:", nftImplementation);
    await hre.run("verify:verify", {
      address: nftImplementation,
      constructorArguments: [],
    });

    // Verify Marketplace implementation
    const marketImplementation = await hre.upgrades.erc1967.getImplementationAddress(marketAddress);
    console.log("Verifying Marketplace implementation:", marketImplementation);
    await hre.run("verify:verify", {
      address: marketImplementation,
      constructorArguments: [],
    });

    console.log("Deployment and verification completed!");
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 