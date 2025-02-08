// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./PokemonNFT.sol";

contract PokemonMarketplace is 
    Initializable, 
    OwnableUpgradeable,
    UUPSUpgradeable 
{
    PokemonNFT public pokemonNFT;

    struct Listing {
        address seller;
        uint256 price;
        bool isActive;
    }

    struct Auction {
        address seller;
        uint256 startingPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool isActive;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(address => uint256) public pendingReturns;

    event PokemonListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event PokemonSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event AuctionCreated(uint256 indexed tokenId, address indexed seller, uint256 startingPrice, uint256 endTime);
    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed tokenId, address indexed winner, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner, address _pokemonNFT) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        pokemonNFT = PokemonNFT(_pokemonNFT);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function listPokemon(uint256 tokenId, uint256 price) public {
        require(pokemonNFT.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].isActive, "Already listed");
        require(!auctions[tokenId].isActive, "Currently in auction");

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            isActive: true
        });

        emit PokemonListed(tokenId, msg.sender, price);
    }

    function buyPokemon(uint256 tokenId) public payable {
        Listing memory listing = listings[tokenId];
        require(listing.isActive, "Not listed for sale");
        require(msg.value >= listing.price, "Insufficient payment");

        address seller = listing.seller;
        uint256 price = listing.price;

        delete listings[tokenId];

        pokemonNFT.transferFrom(seller, msg.sender, tokenId);

        (bool sent, ) = payable(seller).call{value: price}("");
        require(sent, "Failed to send payment");

        if (msg.value > price) {
            (bool refunded, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refunded, "Failed to refund excess");
        }

        emit PokemonSold(tokenId, seller, msg.sender, price);
    }

    // ... rest of marketplace functions (createAuction, placeBid, endAuction, etc.) ...
} 