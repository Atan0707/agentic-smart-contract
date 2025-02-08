const hre = require("hardhat");

async function main() {
  try {
    console.log("Deploying PokemonNFT contract...");
    
    const PokemonNFT = await hre.ethers.getContractFactory("PokemonNFT");
    
    // Get the deployer's address
    const [deployer] = await hre.ethers.getSigners();
    
    // Deploy proxy with deployer's address
    console.log("Deploying proxy...");
    const proxy = await hre.upgrades.deployProxy(PokemonNFT, 
      [deployer.address], // initialOwner - using deployer's address
      { 
        kind: 'uups',
        initializer: 'initialize'
      }
    );
    await proxy.waitForDeployment();

    const address = await proxy.getAddress();
    console.log(`PokemonNFT proxy deployed to: ${address}`);

    // Wait for a few blocks
    console.log("Waiting for a few blocks...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Verify implementation
    console.log("Verifying implementation contract...");
    try {
      const implementationAddress = await hre.upgrades.erc1967.getImplementationAddress(address);
      console.log("Implementation address:", implementationAddress);

      await hre.run("verify:verify", {
        address: implementationAddress,
        constructorArguments: [],
      });
      console.log("Implementation contract verified successfully");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("Contract already verified");
      } else {
        console.error("Error verifying contract:", error);
      }
    }

    // Create initial Pokemon...
    const pokemonData = [
      {
        name: "Charizard",
        rarity: 4,
        behavior: "Proud and confident, breathes intense flames",
        pokemonType: 0,
        tokenURI: "ipfs://your_charizard_metadata_uri"
      },
      {
        name: "Blastoise",
        rarity: 3, // EPIC
        behavior: "Calm and strategic, controls water with precision",
        pokemonType: 1, // WATER
        tokenURI: "ipfs://your_blastoise_metadata_uri"
      },
      {
        name: "Venusaur",
        rarity: 3, // EPIC
        behavior: "Gentle giant, nurtures smaller Pokemon",
        pokemonType: 2, // GRASS
        tokenURI: "ipfs://your_venusaur_metadata_uri"
      }
    ];

    for (const pokemon of pokemonData) {
      console.log(`Creating Pokemon: ${pokemon.name}`);
      const tx = await proxy.createPokemon(
        pokemon.name,
        pokemon.rarity,
        pokemon.behavior,
        pokemon.pokemonType,
        pokemon.tokenURI
      );
      const receipt = await tx.wait();
      
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'PokemonCreated'
      );
      
      if (event) {
        const [tokenId, nfcHash] = event.args;
        console.log(`Created ${pokemon.name}:`);
        console.log(`- Token ID: ${tokenId}`);
        console.log(`- NFC Hash: ${nfcHash}`);
        console.log('------------------------');
      }
    }

    console.log("Deployment and initialization completed successfully!");

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