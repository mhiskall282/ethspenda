// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title EthSpenda
 * @dev Smart contract for converting ETH and ERC20 tokens to mobile money across Africa
 * @author EthSpenda Team
 * 
 * Features:
 * - Support for ETH and ERC20 token transfers
 * - Integration with Chainlink price feeds for accurate USD conversion
 * - Support for multiple mobile money providers across African countries
 * - Fee management with configurable rates
 * - Emergency pause functionality
 * - Comprehensive event logging for off-chain processing
 * - Secure handling of funds with reentrancy protection
 */
contract EthSpenda is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000 basis points
    uint256 public constant MAX_FEE_RATE = 500; // 5% maximum fee
    uint256 public constant MIN_TRANSFER_AMOUNT = 0.001 ether; // Minimum transfer amount in wei
    
    // ============ State Variables ============
    
    // Fee configuration
    uint256 public platformFeeRate; // Fee rate in basis points (0 = no fee)
    address public feeCollector; // Address that receives platform fees
    
    // Price feed contracts for different networks
    mapping(address => AggregatorV3Interface) public priceFeeds; // token address => price feed
    AggregatorV3Interface public ethUsdPriceFeed; // ETH/USD price feed
    
    // Supported mobile money providers
    mapping(string => bool) public supportedProviders; // provider code => supported
    mapping(string => bool) public supportedCountries; // country code => supported
    
    // Transaction tracking
    mapping(bytes32 => bool) public processedTransactions; // transaction hash => processed
    uint256 public totalTransactions;
    uint256 public totalVolumeUSD; // Total volume in USD (scaled by 1e8)
    
    // Emergency controls
    mapping(address => bool) public authorizedOperators; // addresses authorized to process transactions
    
    // ============ Structs ============
    
    struct TransferRequest {
        address sender;
        address token; // address(0) for ETH
        uint256 amount;
        string recipientPhone;
        string countryCode;
        string providerCode;
        uint256 usdAmount; // USD amount at time of transfer (scaled by 1e8)
        uint256 timestamp;
        bytes32 requestId;
    }
    
    // ============ Events ============
    
    event TransferInitiated(
        bytes32 indexed requestId,
        address indexed sender,
        address indexed token,
        uint256 amount,
        string recipientPhone,
        string countryCode,
        string providerCode,
        uint256 usdAmount,
        uint256 timestamp
    );
    
    event TransferCompleted(
        bytes32 indexed requestId,
        bool success,
        string transactionRef,
        uint256 timestamp
    );
    
    event TransferFailed(
        bytes32 indexed requestId,
        string reason,
        uint256 timestamp
    );
    
    event FeeCollected(
        bytes32 indexed requestId,
        uint256 feeAmount,
        address feeCollector,
        uint256 timestamp
    );
    
    event PriceFeedUpdated(
        address indexed token,
        address indexed priceFeed,
        uint256 timestamp
    );
    
    event ProviderAdded(string providerCode, uint256 timestamp);
    event ProviderRemoved(string providerCode, uint256 timestamp);
    event CountryAdded(string countryCode, uint256 timestamp);
    event CountryRemoved(string countryCode, uint256 timestamp);
    
    event OperatorAdded(address indexed operator, uint256 timestamp);
    event OperatorRemoved(address indexed operator, uint256 timestamp);
    
    event EmergencyWithdraw(
        address indexed token,
        uint256 amount,
        address indexed recipient,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    modifier onlyOperator() {
        require(authorizedOperators[msg.sender] || msg.sender == owner(), "Not authorized operator");
        _;
    }
    
    modifier validTransferParams(
        address token,
        uint256 amount,
        string memory recipientPhone,
        string memory countryCode,
        string memory providerCode
    ) {
        require(amount >= MIN_TRANSFER_AMOUNT, "Amount below minimum");
        require(bytes(recipientPhone).length >= 10, "Invalid phone number");
        require(supportedCountries[countryCode], "Country not supported");
        require(supportedProviders[providerCode], "Provider not supported");
        
        if (token == address(0)) {
            require(msg.value == amount, "ETH amount mismatch");
        } else {
            require(msg.value == 0, "ETH sent with token transfer");
            require(IERC20(token).balanceOf(msg.sender) >= amount, "Insufficient token balance");
        }
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _ethUsdPriceFeed,
        address _feeCollector,
        uint256 _platformFeeRate
    ) Ownable(msg.sender) {
        require(_ethUsdPriceFeed != address(0), "Invalid ETH price feed");
        require(_feeCollector != address(0), "Invalid fee collector");
        require(_platformFeeRate <= MAX_FEE_RATE, "Fee rate too high");
        
        ethUsdPriceFeed = AggregatorV3Interface(_ethUsdPriceFeed);
        feeCollector = _feeCollector;
        platformFeeRate = _platformFeeRate;
        
        // Add owner as authorized operator
        authorizedOperators[msg.sender] = true;
        
        // Initialize supported countries
        _addCountry("KE"); // Kenya
        _addCountry("NG"); // Nigeria
        _addCountry("GH"); // Ghana
        _addCountry("UG"); // Uganda
        _addCountry("TZ"); // Tanzania
        _addCountry("RW"); // Rwanda
        
        // Initialize supported providers
        _addProvider("mpesa");
        _addProvider("airtel");
        _addProvider("opay");
        _addProvider("kuda");
        _addProvider("mtn");
    }
    
    // ============ Main Functions ============
    
    /**
     * @dev Initiate a transfer from crypto to mobile money
     * @param token Token contract address (address(0) for ETH)
     * @param amount Amount of tokens to transfer
     * @param recipientPhone Recipient's phone number (with country code)
     * @param countryCode ISO country code (e.g., "KE" for Kenya)
     * @param providerCode Mobile money provider code (e.g., "mpesa")
     */
    function initiateTransfer(
        address token,
        uint256 amount,
        string memory recipientPhone,
        string memory countryCode,
        string memory providerCode
    ) 
        external 
        payable 
        nonReentrant 
        whenNotPaused
        validTransferParams(token, amount, recipientPhone, countryCode, providerCode)
        returns (bytes32 requestId)
    {
        // Generate unique request ID
        requestId = keccak256(
            abi.encodePacked(
                msg.sender,
                token,
                amount,
                recipientPhone,
                countryCode,
                providerCode,
                block.timestamp,
                totalTransactions
            )
        );
        
        require(!processedTransactions[requestId], "Duplicate transaction");
        
        // Get USD value of the transfer
        uint256 usdAmount = _getUSDValue(token, amount);
        require(usdAmount > 0, "Invalid USD conversion");
        
        // Handle fee collection and transfer
        uint256 transferAmount = _handleFeeAndTransfer(token, amount, requestId);
        
        // Update tracking variables
        totalTransactions++;
        totalVolumeUSD += usdAmount;
        processedTransactions[requestId] = true;
        
        // Emit event for off-chain processing
        emit TransferInitiated(
            requestId,
            msg.sender,
            token,
            transferAmount,
            recipientPhone,
            countryCode,
            providerCode,
            usdAmount,
            block.timestamp
        );
        
        return requestId;
    }
    
    /**
     * @dev Handle fee collection and token transfer (internal function to reduce stack depth)
     */
    function _handleFeeAndTransfer(
        address token,
        uint256 amount,
        bytes32 requestId
    ) internal returns (uint256 transferAmount) {
        transferAmount = amount;
        
        // Calculate and collect platform fee
        if (platformFeeRate > 0) {
            uint256 feeAmount = (amount * platformFeeRate) / BASIS_POINTS;
            transferAmount = amount - feeAmount;
            
            if (token == address(0)) {
                // ETH transfer
                (bool feeSuccess, ) = feeCollector.call{value: feeAmount}("");
                require(feeSuccess, "Fee transfer failed");
            } else {
                // ERC20 transfer
                IERC20(token).safeTransferFrom(msg.sender, feeCollector, feeAmount);
            }
            
            emit FeeCollected(requestId, feeAmount, feeCollector, block.timestamp);
        }
        
        // Transfer tokens to contract (they will be held until processing is complete)
        if (token != address(0)) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), transferAmount);
        }
        // ETH is already in the contract via msg.value
        
        return transferAmount;
    }
    
    /**
     * @dev Complete a transfer (called by authorized operators after mobile money transfer)
     * @param requestId The unique request ID from initiateTransfer
     * @param success Whether the mobile money transfer was successful
     * @param transactionRef Reference ID from mobile money provider
     */
    function completeTransfer(
        bytes32 requestId,
        bool success,
        string memory transactionRef
    ) external onlyOperator {
        require(processedTransactions[requestId], "Invalid request ID");
        
        if (success) {
            emit TransferCompleted(requestId, true, transactionRef, block.timestamp);
        } else {
            emit TransferCompleted(requestId, false, transactionRef, block.timestamp);
        }
    }
    
    /**
     * @dev Mark a transfer as failed and enable refund
     * @param requestId The unique request ID
     * @param reason Reason for failure
     */
    function failTransfer(
        bytes32 requestId,
        string memory reason
    ) external onlyOperator {
        require(processedTransactions[requestId], "Invalid request ID");
        
        emit TransferFailed(requestId, reason, block.timestamp);
    }
    
    // ============ Price Feed Functions ============
    
    /**
     * @dev Get USD value of a token amount using Chainlink price feeds
     * @param token Token address (address(0) for ETH)
     * @param amount Token amount
     * @return USD value scaled by 1e8
     */
    function _getUSDValue(address token, uint256 amount) internal view returns (uint256) {
        AggregatorV3Interface priceFeed;
        
        if (token == address(0)) {
            priceFeed = ethUsdPriceFeed;
        } else {
            priceFeed = priceFeeds[token];
            require(address(priceFeed) != address(0), "Price feed not configured");
        }
        
        (, int256 price, , uint256 updatedAt, ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price");
        require(updatedAt > block.timestamp - 3600, "Price data too old"); // 1 hour max age
        
        // For ERC20 tokens, we need to handle decimals differently
        uint256 tokenDecimals;
        if (token == address(0)) {
            tokenDecimals = 18; // ETH has 18 decimals
        } else {
            // Try to get decimals, default to 18 if not available
            try IERC20Metadata(token).decimals() returns (uint8 dec) {
                tokenDecimals = dec;
            } catch {
                tokenDecimals = 18;
            }
        }
        
        // Convert to USD with proper decimal handling
        return (amount * uint256(price)) / (10 ** tokenDecimals);
    }
    
    /**
     * @dev Get current USD value for display purposes
     * @param token Token address (address(0) for ETH)
     * @param amount Token amount
     * @return USD value scaled by 1e8
     */
    function getUSDValue(address token, uint256 amount) external view returns (uint256) {
        return _getUSDValue(token, amount);
    }
    
    /**
     * @dev Get latest price for a token
     * @param token Token address (address(0) for ETH)
     * @return price Latest price scaled by price feed decimals
     * @return updatedAt Timestamp of last price update
     */
    function getLatestPrice(address token) external view returns (int256 price, uint256 updatedAt) {
        AggregatorV3Interface priceFeed = token == address(0) ? ethUsdPriceFeed : priceFeeds[token];
        require(address(priceFeed) != address(0), "Price feed not configured");
        
        (, price, , updatedAt, ) = priceFeed.latestRoundData();
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Set price feed for a token
     * @param token Token address
     * @param priceFeed Chainlink price feed address
     */
    function setPriceFeed(address token, address priceFeed) external onlyOwner {
        require(priceFeed != address(0), "Invalid price feed");
        priceFeeds[token] = AggregatorV3Interface(priceFeed);
        emit PriceFeedUpdated(token, priceFeed, block.timestamp);
    }
    
    /**
     * @dev Set ETH price feed
     * @param priceFeed Chainlink ETH/USD price feed address
     */
    function setEthPriceFeed(address priceFeed) external onlyOwner {
        require(priceFeed != address(0), "Invalid price feed");
        ethUsdPriceFeed = AggregatorV3Interface(priceFeed);
        emit PriceFeedUpdated(address(0), priceFeed, block.timestamp);
    }
    
    /**
     * @dev Update platform fee rate
     * @param newFeeRate New fee rate in basis points
     */
    function setPlatformFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= MAX_FEE_RATE, "Fee rate too high");
        platformFeeRate = newFeeRate;
    }
    
    /**
     * @dev Update fee collector address
     * @param newFeeCollector New fee collector address
     */
    function setFeeCollector(address newFeeCollector) external onlyOwner {
        require(newFeeCollector != address(0), "Invalid fee collector");
        feeCollector = newFeeCollector;
    }
    
    /**
     * @dev Add supported mobile money provider
     * @param providerCode Provider code (e.g., "mpesa")
     */
    function addProvider(string memory providerCode) external onlyOwner {
        _addProvider(providerCode);
    }
    
    function _addProvider(string memory providerCode) internal {
        require(bytes(providerCode).length > 0, "Invalid provider code");
        supportedProviders[providerCode] = true;
        emit ProviderAdded(providerCode, block.timestamp);
    }
    
    /**
     * @dev Remove supported mobile money provider
     * @param providerCode Provider code to remove
     */
    function removeProvider(string memory providerCode) external onlyOwner {
        supportedProviders[providerCode] = false;
        emit ProviderRemoved(providerCode, block.timestamp);
    }
    
    /**
     * @dev Add supported country
     * @param countryCode ISO country code (e.g., "KE")
     */
    function addCountry(string memory countryCode) external onlyOwner {
        _addCountry(countryCode);
    }
    
    function _addCountry(string memory countryCode) internal {
        require(bytes(countryCode).length == 2, "Invalid country code");
        supportedCountries[countryCode] = true;
        emit CountryAdded(countryCode, block.timestamp);
    }
    
    /**
     * @dev Remove supported country
     * @param countryCode Country code to remove
     */
    function removeCountry(string memory countryCode) external onlyOwner {
        supportedCountries[countryCode] = false;
        emit CountryRemoved(countryCode, block.timestamp);
    }
    
    /**
     * @dev Add authorized operator
     * @param operator Address to authorize
     */
    function addOperator(address operator) external onlyOwner {
        require(operator != address(0), "Invalid operator");
        authorizedOperators[operator] = true;
        emit OperatorAdded(operator, block.timestamp);
    }
    
    /**
     * @dev Remove authorized operator
     * @param operator Address to remove
     */
    function removeOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = false;
        emit OperatorRemoved(operator, block.timestamp);
    }
    
    /**
     * @dev Pause contract (emergency use)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw function (only in case of critical issues)
     * @param token Token to withdraw (address(0) for ETH)
     * @param amount Amount to withdraw
     * @param recipient Recipient address
     */
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address recipient
    ) external onlyOwner whenPaused {
        require(recipient != address(0), "Invalid recipient");
        
        if (token == address(0)) {
            require(address(this).balance >= amount, "Insufficient ETH balance");
            (bool success, ) = recipient.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(recipient, amount);
        }
        
        emit EmergencyWithdraw(token, amount, recipient, block.timestamp);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 _totalTransactions,
        uint256 _totalVolumeUSD,
        uint256 _platformFeeRate,
        bool _isPaused
    ) {
        return (totalTransactions, totalVolumeUSD, platformFeeRate, paused());
    }
    
    /**
     * @dev Check if provider is supported
     * @param providerCode Provider code to check
     */
    function isProviderSupported(string memory providerCode) external view returns (bool) {
        return supportedProviders[providerCode];
    }
    
    /**
     * @dev Check if country is supported
     * @param countryCode Country code to check
     */
    function isCountrySupported(string memory countryCode) external view returns (bool) {
        return supportedCountries[countryCode];
    }
    
    /**
     * @dev Check if address is authorized operator
     * @param operator Address to check
     */
    function isAuthorizedOperator(address operator) external view returns (bool) {
        return authorizedOperators[operator] || operator == owner();
    }
    
    /**
     * @dev Get contract balance for a token
     * @param token Token address (address(0) for ETH)
     */
    function getBalance(address token) external view returns (uint256) {
        if (token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(token).balanceOf(address(this));
        }
    }
    
    // ============ Fallback Functions ============
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Accept ETH deposits
    }
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {
        revert("Function not found");
    }
}
