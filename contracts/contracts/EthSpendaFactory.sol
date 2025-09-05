// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./EthSpenda.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EthSpendaFactory
 * @dev Factory contract for deploying EthSpenda contracts across multiple chains
 * @author EthSpenda Team
 * 
 * This factory ensures consistent deployment parameters and allows for
 * centralized management of EthSpenda instances across different blockchains.
 */
contract EthSpendaFactory is Ownable {
    
    // ============ Events ============
    
    event EthSpendaDeployed(
        address indexed ethSpendaAddress,
        uint256 indexed chainId,
        address ethUsdPriceFeed,
        address feeCollector,
        uint256 platformFeeRate,
        uint256 timestamp
    );
    
    // ============ State Variables ============
    
    // Mapping of chain ID to deployed EthSpenda contract address
    mapping(uint256 => address) public deployedContracts;
    
    // Array to track all deployed contracts
    address[] public allDeployedContracts;
    
    // Default deployment parameters
    struct DeploymentParams {
        address ethUsdPriceFeed;
        address feeCollector;
        uint256 platformFeeRate;
    }
    
    // Default parameters for known chains
    mapping(uint256 => DeploymentParams) public defaultParams;
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        // Set default parameters for supported chains
        _setDefaultParams();
    }
    
    // ============ Deployment Functions ============
    
    /**
     * @dev Deploy EthSpenda contract with custom parameters
     * @param ethUsdPriceFeed Chainlink ETH/USD price feed address
     * @param feeCollector Address to receive platform fees
     * @param platformFeeRate Fee rate in basis points
     */
    function deployEthSpenda(
        address ethUsdPriceFeed,
        address feeCollector,
        uint256 platformFeeRate
    ) public onlyOwner returns (address) {
        require(deployedContracts[block.chainid] == address(0), "Already deployed on this chain");
        
        // Deploy new EthSpenda contract
        EthSpenda ethSpenda = new EthSpenda(
            ethUsdPriceFeed,
            feeCollector,
            platformFeeRate
        );
        
        address ethSpendaAddress = address(ethSpenda);
        
        // Store deployment info
        deployedContracts[block.chainid] = ethSpendaAddress;
        allDeployedContracts.push(ethSpendaAddress);
        
        emit EthSpendaDeployed(
            ethSpendaAddress,
            block.chainid,
            ethUsdPriceFeed,
            feeCollector,
            platformFeeRate,
            block.timestamp
        );
        
        return ethSpendaAddress;
    }
    
    /**
     * @dev Deploy EthSpenda contract with default parameters for current chain
     */
    function deployEthSpendaWithDefaults() external onlyOwner returns (address) {
        DeploymentParams memory params = defaultParams[block.chainid];
        require(params.ethUsdPriceFeed != address(0), "No default params for this chain");
        
        return deployEthSpenda(
            params.ethUsdPriceFeed,
            params.feeCollector,
            params.platformFeeRate
        );
    }
    
    // ============ Configuration Functions ============
    
    /**
     * @dev Set default deployment parameters for a chain
     * @param chainId Chain ID
     * @param ethUsdPriceFeed ETH/USD price feed address
     * @param feeCollector Fee collector address
     * @param platformFeeRate Platform fee rate in basis points
     */
    function setDefaultParams(
        uint256 chainId,
        address ethUsdPriceFeed,
        address feeCollector,
        uint256 platformFeeRate
    ) external onlyOwner {
        require(ethUsdPriceFeed != address(0), "Invalid price feed");
        require(feeCollector != address(0), "Invalid fee collector");
        require(platformFeeRate <= 500, "Fee rate too high"); // Max 5%
        
        defaultParams[chainId] = DeploymentParams({
            ethUsdPriceFeed: ethUsdPriceFeed,
            feeCollector: feeCollector,
            platformFeeRate: platformFeeRate
        });
    }
    
    /**
     * @dev Set default parameters for known chains
     */
    function _setDefaultParams() internal {
        // Ethereum Mainnet (Chain ID: 1)
        defaultParams[1] = DeploymentParams({
            ethUsdPriceFeed: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419, // Chainlink ETH/USD
            feeCollector: msg.sender, // Factory deployer initially
            platformFeeRate: 0 // No fees initially
        });
        
        // Base Mainnet (Chain ID: 8453)
        defaultParams[8453] = DeploymentParams({
            ethUsdPriceFeed: 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70, // Chainlink ETH/USD on Base
            feeCollector: msg.sender,
            platformFeeRate: 0
        });
        
        // Base Sepolia (Chain ID: 84532)
        defaultParams[84532] = DeploymentParams({
            ethUsdPriceFeed: 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1, // Chainlink ETH/USD on Base Sepolia
            feeCollector: msg.sender,
            platformFeeRate: 0
        });
        
        // Lisk Mainnet (Chain ID: 1135)
        defaultParams[1135] = DeploymentParams({
            ethUsdPriceFeed: address(0), // To be updated when available
            feeCollector: msg.sender,
            platformFeeRate: 0
        });
        
        // Lisk Sepolia (Chain ID: 4202)
        defaultParams[4202] = DeploymentParams({
            ethUsdPriceFeed: address(0), // To be updated when available
            feeCollector: msg.sender,
            platformFeeRate: 0
        });
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get deployed contract address for a chain
     * @param chainId Chain ID
     */
    function getDeployedContract(uint256 chainId) external view returns (address) {
        return deployedContracts[chainId];
    }
    
    /**
     * @dev Get all deployed contracts
     */
    function getAllDeployedContracts() external view returns (address[] memory) {
        return allDeployedContracts;
    }
    
    /**
     * @dev Get deployment count
     */
    function getDeploymentCount() external view returns (uint256) {
        return allDeployedContracts.length;
    }
    
    /**
     * @dev Get default parameters for a chain
     * @param chainId Chain ID
     */
    function getDefaultParams(uint256 chainId) external view returns (
        address ethUsdPriceFeed,
        address feeCollector,
        uint256 platformFeeRate
    ) {
        DeploymentParams memory params = defaultParams[chainId];
        return (params.ethUsdPriceFeed, params.feeCollector, params.platformFeeRate);
    }
    
    /**
     * @dev Check if contract is deployed on a chain
     * @param chainId Chain ID
     */
    function isDeployedOnChain(uint256 chainId) external view returns (bool) {
        return deployedContracts[chainId] != address(0);
    }
    
    /**
     * @dev Get current chain deployment status
     */
    function getCurrentChainDeployment() external view returns (bool deployed, address contractAddress) {
        contractAddress = deployedContracts[block.chainid];
        deployed = contractAddress != address(0);
    }
}
