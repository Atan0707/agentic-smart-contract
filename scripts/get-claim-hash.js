const hre = require("hardhat");

async function main() {
  // Replace with your deployed contract address
  const NFT_CONTRACT_ADDRESS = "YOUR_DEPLOYED_NFT_ADDRESS";
  
  // Get the owner's signer
  const [owner] = await hre.ethers.getSigners();
  
  // Connect with owner's account
  const pokemonNFT = await hre.ethers.getContractAt("PokemonNFT", NFT_CONTRACT_ADDRESS, owner);

  console.log("Creating Pokemon as:", await owner.getAddress());
  
  // Create Pokemon and get hash
  try {
    const tx = await pokemonNFT.createPokemon(
      "Charizard",
      4, // LEGENDARY
      "Proud and confident",
      0, // FIRE
      "ipfs://your_uri"
    );

    console.log("Waiting for transaction...");
    const receipt = await tx.wait();
    
    // Get the PokemonCreated event
    const event = receipt.logs.find(
      log => log.fragment && log.fragment.name === 'PokemonCreated'
    );
    
    if (event) {
      const [tokenId, claimHash] = event.args;
      console.log("\n=== STORE THIS INFORMATION IN YOUR NFC ===");
      console.log("Claim Hash:", claimHash);
      console.log("Token ID:", tokenId.toString());
      console.log("=======================================");
    }
  } catch (error) {
    if (error.message.includes("OwnableUnauthorizedAccount")) {
      console.error("Error: Only the contract owner can create Pokemon");
    } else {
      console.error("Error:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 