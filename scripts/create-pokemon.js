const hre = require("hardhat");

async function main() {
  // Contract address from your deployment
  const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  
  const pokemonNFT = await hre.ethers.getContractAt("PokemonNFT", CONTRACT_ADDRESS);

  const newPokemon = {
    name: "Pikachu",
    rarity: 2, // RARE
    behavior: "Energetic and playful, loves to shock things",
    pokemonType: 3, // ELECTRIC
    tokenURI: "ipfs://your_pikachu_metadata_uri"
  };

  console.log(`Creating Pokemon: ${newPokemon.name}`);
  const tx = await pokemonNFT.createPokemon(
    newPokemon.name,
    newPokemon.rarity,
    newPokemon.behavior,
    newPokemon.pokemonType,
    newPokemon.tokenURI
  );
  
  const receipt = await tx.wait();
  const event = receipt.logs.find(
    log => log.fragment && log.fragment.name === 'PokemonCreated'
  );
  
  if (event) {
    const [tokenId, nfcHash] = event.args;
    console.log(`Created ${newPokemon.name}:`);
    console.log(`- Token ID: ${tokenId}`);
    console.log(`- NFC Hash: ${nfcHash}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 