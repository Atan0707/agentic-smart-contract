const hre = require("hardhat");

async function main() {
  try {
    console.log("Deploying PokemonNFT contract...");
    
    const PokemonNFT = await hre.ethers.getContractFactory("PokemonNFT");
    const pokemonNFT = await PokemonNFT.deploy();
    await pokemonNFT.waitForDeployment();

    const address = await pokemonNFT.getAddress();
    console.log(`PokemonNFT deployed to: ${address}`);

    // Wait for a few blocks for better verification
    console.log("Waiting for a few blocks...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Verify contract on Etherscan
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: []
      });
      console.log("Contract verified successfully");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("Contract already verified");
      } else {
        console.error("Error verifying contract:", error);
      }
    }

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