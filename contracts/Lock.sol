// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FractionalizedNodeLicense is ERC721, Ownable, ReentrancyGuard {
    uint256 public constant FRACTIONS_PER_LICENSE = 10;
    uint256 public constant TOTAL_LICENSES = 500;
    uint256 public constant TOTAL_FRACTIONS = TOTAL_LICENSES * FRACTIONS_PER_LICENSE;
    uint256 public constant FRACTION_PRICE = 0.005 ether;
    uint256 public constant PLATFORM_FEE = 0.002 ether;

    uint256 private _currentTokenId;
    uint256 public soldFractions;
    mapping(uint256 => uint256) public batchToLicense;
    mapping(address => uint256) public userPurchases;

    struct FractionInfo {
        address owner;
        uint256 tokenId;
        string chain;
        uint256 chainId;
    }

    mapping(bytes32 => bool) public usedPurchaseIds;
    mapping(uint256 => FractionInfo[]) public batchFractions;
    mapping(address => bool) public blacklist;
    uint256 public saleStartTime;
    uint256 public saleEndTime;

    event FractionPurchased(address indexed user, uint256 quantity, bytes32 purchaseId);
    event FractionMinted(address indexed user, uint256 tokenId);
    event BatchFilled(uint256 batchId, uint256 licenseId);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event SalePeriodSet(uint256 startTime, uint256 endTime);
    event BlacklistUpdated(address user, bool status);
    event SaleReset(uint256 timestamp);

    constructor(address initialOwner)
        ERC721("Fractionalized Node License", "FNL")
        Ownable(initialOwner)
    {}

    function setSalePeriod(uint256 _startTime, uint256 _endTime) external onlyOwner {
        require(_startTime < _endTime, "Invalid time range");
        require(_startTime > block.timestamp, "Start time must be in the future");
        saleStartTime = _startTime;
        saleEndTime = _endTime;
        soldFractions = 0; // Reset sold fractions when setting a new sale period
        emit SalePeriodSet(_startTime, _endTime);
        emit SaleReset(block.timestamp);
    }

    function isSaleActive() public view returns (bool) {
        return (block.timestamp >= saleStartTime && block.timestamp <= saleEndTime);
    }

    function updateBlacklist(address user, bool status) external onlyOwner {
        blacklist[user] = status;
        emit BlacklistUpdated(user, status);
    }

    function mint(uint256 quantity, bytes32 purchaseId, string calldata chain, uint256 chainId) external payable nonReentrant {
        require(isSaleActive(), "Sale is not active");
        require(!blacklist[msg.sender], "User is blacklisted");
        require(quantity > 0 && quantity <= 10, "Invalid quantity");
        require(soldFractions + quantity <= TOTAL_FRACTIONS, "Exceeds total fractions");
        require(userPurchases[msg.sender] + quantity <= 10, "Exceeds maximum purchase per user");
        require(!usedPurchaseIds[purchaseId], "Purchase ID already used");

        uint256 totalCost = quantity * (FRACTION_PRICE + PLATFORM_FEE);
        require(msg.value >= totalCost, "Insufficient payment");

        usedPurchaseIds[purchaseId] = true;

        for (uint256 i = 0; i < quantity; i++) {
            _currentTokenId++;
            _safeMint(msg.sender, _currentTokenId);

            uint256 batchId = soldFractions / FRACTIONS_PER_LICENSE;
            batchFractions[batchId].push(FractionInfo(msg.sender, _currentTokenId, chain, chainId));

            soldFractions++;
        }

        userPurchases[msg.sender] += quantity;

        if (soldFractions % FRACTIONS_PER_LICENSE == 0) {
            uint256 completedBatchId = (soldFractions / FRACTIONS_PER_LICENSE) - 1;
            batchToLicense[completedBatchId] = completedBatchId;
            emit BatchFilled(completedBatchId, completedBatchId);
        }

        emit FractionPurchased(msg.sender, quantity, purchaseId);

        uint256 excess = msg.value - totalCost;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
    }

    function burn(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
    }

    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
        emit FundsWithdrawn(owner(), balance);
    }

    function currentTokenId() external view returns (uint256) {
        return _currentTokenId;
    }

    function getBatchInfo(uint256 batchId) external view returns (FractionInfo[] memory) {
        return batchFractions[batchId];
    }

    function getSaleStatus() external view returns (bool isActive, uint256 endTime, uint256 currentSoldFractions) {
        return (isSaleActive(), saleEndTime, soldFractions);
    }
}