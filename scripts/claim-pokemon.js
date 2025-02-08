const { ethers } = require("hardhat");

async function main() {
  // Replace with your deployed contract address
  const NFT_CONTRACT_ADDRESS = "YOUR_DEPLOYED_NFT_ADDRESS";
  
  const pokemonNFT = await ethers.getContractAt("PokemonNFT", NFT_CONTRACT_ADDRESS);

  // The tokenId and hash you got from create-pokemon-with-hash.js
  const tokenId = "1"; // Replace with actual tokenId
  const nfcHash = "0x..."; // Replace with the actual hash from NFC card

  console.log("Claiming Pokemon...");
  try {
    const tx = await pokemonNFT.claimPokemon(tokenId, nfcHash);
    await tx.wait();
    
    console.log("Pokemon claimed successfully!");
    console.log("Token ID:", tokenId);
    console.log("Owner:", await pokemonNFT.ownerOf(tokenId));
  } catch (error) {
    if (error.message.includes("Pokemon already claimed")) {
      console.error("This Pokemon has already been claimed!");
    } else if (error.message.includes("Invalid NFC hash")) {
      console.error("The NFC hash is not valid for this Pokemon!");
    } else {
      console.error("Error:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 