import hre from "hardhat";

// Network configurations
const NETWORK_CONFIG = {
  ethereum: {
    chainId: 1,
    ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    name: "Ethereum Mainnet"
  },
  base: {
    chainId: 8453,
    ethUsdPriceFeed: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
    name: "Base Mainnet"
  },
  baseSepolia: {
    chainId: 84532,
    ethUsdPriceFeed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
    name: "Base Sepolia"
  },
  lisk: {
    chainId: 1135,
    ethUsdPriceFeed: "0x0000000000000000000000000000000000000000", // To be updated
    name: "Lisk Mainnet"
  },
  liskSepolia: {
    chainId: 4202,
    ethUsdPriceFeed: "0x0000000000000000000000000000000000000000", // To be updated
    name: "Lisk Sepolia"
  }
};

async function main() {
  console.log("🚀 Starting EthSpenda deployment...");

  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  console.log("📋 Deployment Details:");
  console.log("  Deployer:", deployer.address);
  console.log("  Chain ID:", chainId);
  console.log("  Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // Find network configuration
  const networkConfig = Object.values(NETWORK_CONFIG).find(config => config.chainId === chainId);
  if (!networkConfig) {
    console.log("⚠️  Unsupported network, using local/testnet configuration");
    networkConfig = {
      chainId,
      ethUsdPriceFeed: "0x0000000000000000000000000000000000000000",
      name: "Local/Testnet"
    };
  }

  console.log("  Network:", networkConfig.name);

  // Check if we have a price feed for this network
  let priceFeedAddress = networkConfig.ethUsdPriceFeed;
  if (priceFeedAddress === "0x0000000000000000000000000000000000000000") {
    console.log("⚠️  No price feed configured for this network");
    console.log("   Deploying mock price feed for testing...");
    
    // Deploy mock price feed for testing
    const MockV3Aggregator = await hre.ethers.getContractFactory("MockV3Aggregator");
    const mockPriceFeed = await MockV3Aggregator.deploy(8, hre.ethers.parseUnits("3250", 8)); // $3250 ETH
    await mockPriceFeed.waitForDeployment();
    priceFeedAddress = await mockPriceFeed.getAddress();
    console.log("   Mock Price Feed deployed at:", priceFeedAddress);
  }

  // Deploy EthSpenda Factory
  console.log("\n📄 Deploying EthSpenda Factory...");
  const EthSpendaFactory = await hre.ethers.getContractFactory("EthSpendaFactory");
  const factory = await EthSpendaFactory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("✅ EthSpenda Factory deployed at:", factoryAddress);

  // Deploy EthSpenda contract
  console.log("\n📄 Deploying EthSpenda main contract...");
  const feeCollector = deployer.address; // Use deployer as initial fee collector
  const platformFeeRate = 0; // 0% initial fee

  const deployTx = await factory.deployEthSpenda(
    priceFeedAddress,
    feeCollector,
    platformFeeRate
  );

  const receipt = await deployTx.wait();
  
  // Find the deployment event
  const deploymentEvent = receipt?.logs?.find(
    (log: any) => log.topics[0] === factory.interface.getEvent("EthSpendaDeployed").topicHash
  );

  if (!deploymentEvent) {
    throw new Error("Deployment event not found");
  }

  const decodedEvent = factory.interface.decodeEventLog("EthSpendaDeployed", deploymentEvent.data, deploymentEvent.topics);
  const ethSpendaAddress = decodedEvent.ethSpendaAddress;

  console.log("✅ EthSpenda deployed at:", ethSpendaAddress);

  // Get the deployed contract instance
  const EthSpenda = await hre.ethers.getContractFactory("EthSpenda");
  const ethSpenda = EthSpenda.attach(ethSpendaAddress);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  console.log("  Owner:", await ethSpenda.owner());
  console.log("  Fee Collector:", await ethSpenda.feeCollector());
  console.log("  Platform Fee Rate:", await ethSpenda.platformFeeRate(), "basis points");
  console.log("  ETH Price Feed:", await ethSpenda.ethUsdPriceFeed());
  
  // Check supported countries and providers
  const supportedCountries = ["KE", "NG", "GH", "UG", "TZ", "RW"];
  const supportedProviders = ["mpesa", "airtel", "opay", "kuda", "mtn"];
  
  console.log("\n📍 Supported Countries:");
  for (const country of supportedCountries) {
    const isSupported = await ethSpenda.isCountrySupported(country);
    console.log(`  ${country}: ${isSupported ? "✅" : "❌"}`);
  }
  
  console.log("\n💳 Supported Providers:");
  for (const provider of supportedProviders) {
    const isSupported = await ethSpenda.isProviderSupported(provider);
    console.log(`  ${provider}: ${isSupported ? "✅" : "❌"}`);
  }

  // Get latest price (if available)
  try {
    const [price, updatedAt] = await ethSpenda.getLatestPrice(hre.ethers.ZeroAddress);
    console.log("\n💰 ETH Price Information:");
    console.log("  Current Price: $" + hre.ethers.formatUnits(price, 8));
    console.log("  Last Updated:", new Date(Number(updatedAt) * 1000).toISOString());
  } catch (error) {
    console.log("\n⚠️  Could not fetch ETH price - price feed may not be available");
  }

  // Display deployment summary
  console.log("\n🎉 Deployment Summary:");
  console.log("════════════════════════════════════════");
  console.log(`Network: ${networkConfig.name} (Chain ID: ${chainId})`);
  console.log(`Factory Address: ${factoryAddress}`);
  console.log(`EthSpenda Address: ${ethSpendaAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Fee Collector: ${feeCollector}`);
  console.log(`Platform Fee: ${platformFeeRate / 100}%`);
  console.log("════════════════════════════════════════");

  // Save deployment info
  const deploymentInfo = {
    network: networkConfig.name,
    chainId,
    factoryAddress,
    ethSpendaAddress,
    deployer: deployer.address,
    feeCollector,
    platformFeeRate,
    ethUsdPriceFeed: priceFeedAddress,
    deploymentBlock: receipt?.blockNumber,
    deploymentTxHash: receipt?.hash,
    timestamp: new Date().toISOString()
  };

  console.log("\n💾 Deployment info for frontend integration:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Instructions for next steps
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contracts on block explorer (if on public network)");
  console.log("2. Update frontend configuration with contract addresses");
  console.log("3. Configure additional price feeds for supported tokens");
  console.log("4. Set up off-chain infrastructure for mobile money integration");
  console.log("5. Add authorized operators for transaction processing");
  
  if (chainId === 1 || chainId === 8453 || chainId === 1135) {
    console.log("\n⚡ This is a mainnet deployment - please double-check all parameters!");
  }

  return {
    factoryAddress,
    ethSpendaAddress,
    deploymentInfo
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
