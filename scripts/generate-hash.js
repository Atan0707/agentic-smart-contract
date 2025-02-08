const { ethers } = require("hardhat");

async function main() {
  const NFT_CONTRACT_ADDRESS = "YOUR_DEPLOYED_NFT_ADDRESS";
  
  // Get the owner's signer
  const [owner] = await ethers.getSigners();
  
  // Connect with owner's account
  const pokemonNFT = await ethers.getContractAt("PokemonNFT", NFT_CONTRACT_ADDRESS, owner);

  console.log("Creating Pokemon as:", await owner.getAddress());
  
  // Create Pokemon
  const tx = await pokemonNFT.createPokemon(
    "Charizard",
    4, // LEGENDARY
    "Proud and confident",
    0, // FIRE
    "ipfs://your_uri"
  );
  
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'PokemonCreated');
  
  if (event) {
    const [tokenId, claimHash] = event.args;
    console.log("Pokemon created with:");
    console.log("Token ID:", tokenId.toString());
    console.log("Claim Hash:", claimHash);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 