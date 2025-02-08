// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PokemonNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _currentTokenId;
    
    struct Pokemon {
        string name;
        Rarity rarity;
        string behavior;
        PokemonType pokemonType;
        bool claimed;
    }

    struct PokemonData {
        string name;
        Rarity rarity;
        string behavior;
        PokemonType pokemonType;
        bool claimed;
        address owner;
        string tokenURI;
    }

    enum Rarity { COMMON, UNCOMMON, RARE, EPIC, LEGENDARY }
    enum PokemonType { FIRE, WATER, GRASS, ELECTRIC, PSYCHIC, NORMAL }

    mapping(uint256 => Pokemon) public pokemons;
    mapping(bytes32 => bool) public usedHashes;

    event PokemonCreated(uint256 indexed tokenId, bytes32 claimHash);
    event PokemonClaimed(uint256 indexed tokenId, address indexed claimer);

    constructor() ERC721("PokemonNFT", "PKMN") Ownable(msg.sender) {}

    function createPokemon(
        string memory name,
        Rarity rarity,
        string memory behavior,
        PokemonType pokemonType,
        string memory uri
    ) public onlyOwner returns (uint256, bytes32) {
        _currentTokenId += 1;
        uint256 newTokenId = _currentTokenId;

        bytes32 claimHash = keccak256(abi.encodePacked(newTokenId, block.timestamp, msg.sender));
        
        pokemons[newTokenId] = Pokemon({
            name: name,
            rarity: rarity,
            behavior: behavior,
            pokemonType: pokemonType,
            claimed: false
        });

        _setTokenURI(newTokenId, uri);
        
        emit PokemonCreated(newTokenId, claimHash);
        return (newTokenId, claimHash);
    }

    function claimPokemon(bytes32 hash) public {
        require(!usedHashes[hash], "Hash already used");
        
        // Find the Pokemon with this hash
        uint256 tokenId;
        bool found = false;
        
        // Regenerate hash for each unclaimed Pokemon to find a match
        for(uint256 i = 1; i <= _currentTokenId; i++) {
            if (!pokemons[i].claimed) {
                bytes32 checkHash = keccak256(abi.encodePacked(i, block.timestamp, owner()));
                if (checkHash == hash) {
                    tokenId = i;
                    found = true;
                    break;
                }
            }
        }
        
        require(found, "Invalid or expired hash");
        
        usedHashes[hash] = true;
        pokemons[tokenId].claimed = true;
        _safeMint(msg.sender, tokenId);

        emit PokemonClaimed(tokenId, msg.sender);
    }

    function _getTokenURISafe(uint256 tokenId) internal view returns (string memory) {
        try this.tokenURI(tokenId) returns (string memory uri) {
            return uri;
        } catch {
            return "";
        }
    }

    function getPokemon(uint256 tokenId) public view returns (PokemonData memory) {
        require(_exists(tokenId), "Pokemon doesn't exist");
        Pokemon memory pokemon = pokemons[tokenId];
        
        address owner = address(0);
        if (pokemon.claimed) {
            owner = ownerOf(tokenId);
        }

        return PokemonData({
            name: pokemon.name,
            rarity: pokemon.rarity,
            behavior: pokemon.behavior,
            pokemonType: pokemon.pokemonType,
            claimed: pokemon.claimed,
            owner: owner,
            tokenURI: _getTokenURISafe(tokenId)
        });
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId <= _currentTokenId;
    }

    function isPokemonClaimed(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Pokemon doesn't exist");
        return pokemons[tokenId].claimed;
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
