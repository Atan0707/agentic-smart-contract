const { ethers } = require("hardhat");

async function main() {
  const NFT_CONTRACT_ADDRESS = "YOUR_DEPLOYED_NFT_ADDRESS";
  const pokemonNFT = await ethers.getContractAt("PokemonNFT", NFT_CONTRACT_ADDRESS);

  const tokenId = "1"; // The token ID you want to generate hash for
  
  // Get contract owner
  const owner = await pokemonNFT.owner();
  
  // Get current timestamp and normalize to daily timestamp (same as contract)
  const timestamp = Math.floor(Date.now() / 1000);
  const normalizedTimestamp = timestamp - (timestamp % 86400);
  
  // Generate the hash the same way as the contract
  const hash = ethers.solidityPackedKeccak256(
    ["uint256", "uint256", "address"],
    [tokenId, normalizedTimestamp, owner]
  );

  console.log("Generated NFC Hash for Token ID", tokenId);
  console.log("Hash:", hash);
  console.log("Timestamp used:", normalizedTimestamp);
  console.log("\nStore this hash in your NFC card!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 