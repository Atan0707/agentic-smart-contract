// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract PokemonNFT is 
    Initializable, 
    ERC721Upgradeable, 
    ERC721URIStorageUpgradeable, 
    OwnableUpgradeable,
    UUPSUpgradeable 
{
    using ECDSA for bytes32;
    
    uint256 private _currentTokenId;
    mapping(bytes32 => bool) public claimedNFCs;
    
    struct Pokemon {
        string name;
        Rarity rarity;
        string behavior;
        PokemonType pokemonType;
        bool claimed;
    }

    enum Rarity { COMMON, UNCOMMON, RARE, EPIC, LEGENDARY }
    enum PokemonType { FIRE, WATER, GRASS, ELECTRIC, PSYCHIC, NORMAL }

    mapping(uint256 => Pokemon) public pokemons;

    event PokemonCreated(uint256 indexed tokenId, bytes32 nfcHash);
    event PokemonClaimed(uint256 indexed tokenId, address indexed claimer);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC721_init("PokemonNFT", "PKMN");
        __ERC721URIStorage_init();
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        _currentTokenId = 0;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function createPokemon(
        string memory name,
        Rarity rarity,
        string memory behavior,
        PokemonType pokemonType,
        string memory uri
    ) public onlyOwner returns (uint256, bytes32) {
        _currentTokenId += 1;
        uint256 newTokenId = _currentTokenId;

        bytes32 nfcHash = keccak256(abi.encodePacked(newTokenId, block.timestamp, msg.sender));
        
        pokemons[newTokenId] = Pokemon({
            name: name,
            rarity: rarity,
            behavior: behavior,
            pokemonType: pokemonType,
            claimed: false
        });

        _setTokenURI(newTokenId, uri);
        
        emit PokemonCreated(newTokenId, nfcHash);
        return (newTokenId, nfcHash);
    }

    function claimPokemon(uint256 tokenId, bytes32 nfcHash) public {
        require(!claimedNFCs[nfcHash], "Pokemon already claimed");
        require(!pokemons[tokenId].claimed, "Pokemon already claimed");
        require(keccak256(abi.encodePacked(tokenId, block.timestamp - (block.timestamp % 86400), owner())) == nfcHash, "Invalid NFC hash");

        claimedNFCs[nfcHash] = true;
        pokemons[tokenId].claimed = true;
        _safeMint(msg.sender, tokenId);

        emit PokemonClaimed(tokenId, msg.sender);
    }

    function isPokemonClaimed(uint256 tokenId) public view returns (bool) {
        return pokemons[tokenId].claimed;
    }

    function isNFCHashClaimed(bytes32 nfcHash) public view returns (bool) {
        return claimedNFCs[nfcHash];
    }

    function getPokemon(uint256 tokenId) public view returns (Pokemon memory) {
        require(_exists(tokenId), "Pokemon doesn't exist");
        return pokemons[tokenId];
    }

    function getPokemonType(uint256 tokenId) public view returns (PokemonType) {
        require(_exists(tokenId), "Pokemon doesn't exist");
        return pokemons[tokenId].pokemonType;
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId <= _currentTokenId && !pokemons[tokenId].claimed;
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth)
        internal override(ERC721Upgradeable) returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal override(ERC721Upgradeable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
