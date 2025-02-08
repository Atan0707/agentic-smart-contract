const hre = require("hardhat");

async function main() {
  // Replace with your deployed NFT contract address
  const NFT_CONTRACT_ADDRESS = "YOUR_DEPLOYED_NFT_ADDRESS";
  
  const pokemonNFT = await hre.ethers.getContractAt("PokemonNFT", NFT_CONTRACT_ADDRESS);

  console.log("Creating Pokemon...");
  const tx = await pokemonNFT.createPokemon(
    "Charizard",
    4, // LEGENDARY
    "Proud and confident, breathes intense flames",
    0, // FIRE
    "ipfs://your_charizard_metadata_uri"
  );

  const receipt = await tx.wait();
  
  // Find the PokemonCreated event
  const event = receipt.logs.find(
    log => log.fragment && log.fragment.name === 'PokemonCreated'
  );
  
  if (event) {
    const [tokenId, nfcHash] = event.args;
    console.log("Pokemon created successfully!");
    console.log("Token ID:", tokenId.toString());
    console.log("NFC Hash:", nfcHash);
    
    // Save this hash - it will be needed for the physical NFC card
    console.log("\nStore this hash in your NFC card!");
    console.log("The hash is unique to this Pokemon and will be required for claiming.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 