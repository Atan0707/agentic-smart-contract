const { ethers } = require("hardhat");

async function main() {
  const NFT_CONTRACT_ADDRESS = "YOUR_DEPLOYED_NFT_ADDRESS";
  const pokemonNFT = await ethers.getContractAt("PokemonNFT", NFT_CONTRACT_ADDRESS);

  const tokenId = "1"; // Replace with actual tokenId
  const nfcHash = "0x..."; // Replace with the hash from NFC card

  // Check if hash has been used
  const isClaimed = await pokemonNFT.isNFCHashClaimed(nfcHash);
  console.log("Is hash claimed:", isClaimed);

  // Check if Pokemon is claimed
  const isPokemonClaimed = await pokemonNFT.isPokemonClaimed(tokenId);
  console.log("Is Pokemon claimed:", isPokemonClaimed);

  if (!isClaimed && !isPokemonClaimed) {
    console.log("This Pokemon is available to claim!");
  } else {
    console.log("This Pokemon or hash has already been claimed!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 