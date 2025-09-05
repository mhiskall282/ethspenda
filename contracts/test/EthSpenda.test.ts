import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { EthSpenda, EthSpendaFactory } from "../typechain-types";

describe("EthSpenda", function () {
  // Fixture for deploying contracts
  async function deployEthSpendaFixture() {
    const [owner, feeCollector, operator, user1, user2] = await ethers.getSigners();

    // Deploy mock price feed
    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    const ethUsdPriceFeed = await MockV3Aggregator.deploy(8, ethers.parseUnits("3250", 8)); // $3250 ETH

    // Deploy EthSpenda
    const EthSpenda = await ethers.getContractFactory("EthSpenda");
    const ethSpenda = await EthSpenda.deploy(
      await ethUsdPriceFeed.getAddress(),
      feeCollector.address,
      0 // 0% fee initially
    );

    // Deploy ERC20 token for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy("Test Token", "TEST", 18);

    // Mint tokens to users
    await mockToken.mint(user1.address, ethers.parseEther("1000"));
    await mockToken.mint(user2.address, ethers.parseEther("1000"));

    return {
      ethSpenda,
      ethUsdPriceFeed,
      mockToken,
      owner,
      feeCollector,
      operator,
      user1,
      user2
    };
  }

  describe("Deployment", function () {
    it("Should deploy with correct initial parameters", async function () {
      const { ethSpenda, ethUsdPriceFeed, feeCollector, owner } = await loadFixture(deployEthSpendaFixture);

      expect(await ethSpenda.owner()).to.equal(owner.address);
      expect(await ethSpenda.feeCollector()).to.equal(feeCollector.address);
      expect(await ethSpenda.platformFeeRate()).to.equal(0);
      expect(await ethSpenda.ethUsdPriceFeed()).to.equal(await ethUsdPriceFeed.getAddress());

      // Check initial supported countries
      expect(await ethSpenda.isCountrySupported("KE")).to.be.true;
      expect(await ethSpenda.isCountrySupported("NG")).to.be.true;
      expect(await ethSpenda.isCountrySupported("GH")).to.be.true;

      // Check initial supported providers
      expect(await ethSpenda.isProviderSupported("mpesa")).to.be.true;
      expect(await ethSpenda.isProviderSupported("opay")).to.be.true;
      expect(await ethSpenda.isProviderSupported("airtel")).to.be.true;
    });

    it("Should revert with invalid constructor parameters", async function () {
      const [owner, feeCollector] = await ethers.getSigners();
      const EthSpenda = await ethers.getContractFactory("EthSpenda");

      // Invalid price feed
      await expect(
        EthSpenda.deploy(ethers.ZeroAddress, feeCollector.address, 0)
      ).to.be.revertedWith("Invalid ETH price feed");

      // Invalid fee collector
      const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
      const priceFeed = await MockV3Aggregator.deploy(8, ethers.parseUnits("3250", 8));

      await expect(
        EthSpenda.deploy(await priceFeed.getAddress(), ethers.ZeroAddress, 0)
      ).to.be.revertedWith("Invalid fee collector");

      // Fee rate too high
      await expect(
        EthSpenda.deploy(await priceFeed.getAddress(), feeCollector.address, 1000) // 10%
      ).to.be.revertedWith("Fee rate too high");
    });
  });

  describe("ETH Transfers", function () {
    it("Should successfully initiate ETH transfer", async function () {
      const { ethSpenda, user1 } = await loadFixture(deployEthSpendaFixture);

      const amount = ethers.parseEther("0.1");
      const recipientPhone = "+254712345678";
      const countryCode = "KE";
      const providerCode = "mpesa";

      const tx = await ethSpenda.connect(user1).initiateTransfer(
        ethers.ZeroAddress, // ETH
        amount,
        recipientPhone,
        countryCode,
        providerCode,
        { value: amount }
      );

      const receipt = await tx.wait();
      const transferInitiatedEvent = receipt?.logs?.find(
        log => log.topics[0] === ethSpenda.interface.getEvent("TransferInitiated").topicHash
      );

      expect(transferInitiatedEvent).to.not.be.undefined;
      expect(await ethSpenda.totalTransactions()).to.equal(1);
      expect(await ethSpenda.getBalance(ethers.ZeroAddress)).to.equal(amount);
    });

    it("Should revert ETH transfer with invalid parameters", async function () {
      const { ethSpenda, user1 } = await loadFixture(deployEthSpendaFixture);

      const amount = ethers.parseEther("0.1");

      // Amount below minimum
      await expect(
        ethSpenda.connect(user1).initiateTransfer(
          ethers.ZeroAddress,
          ethers.parseEther("0.0005"), // Below minimum
          "+254712345678",
          "KE",
          "mpesa",
          { value: ethers.parseEther("0.0005") }
        )
      ).to.be.revertedWith("Amount below minimum");

      // Invalid phone number
      await expect(
        ethSpenda.connect(user1).initiateTransfer(
          ethers.ZeroAddress,
          amount,
          "123", // Too short
          "KE",
          "mpesa",
          { value: amount }
        )
      ).to.be.revertedWith("Invalid phone number");

      // Unsupported country
      await expect(
        ethSpenda.connect(user1).initiateTransfer(
          ethers.ZeroAddress,
          amount,
          "+254712345678",
          "US", // Not supported
          "mpesa",
          { value: amount }
        )
      ).to.be.revertedWith("Country not supported");

      // Unsupported provider
      await expect(
        ethSpenda.connect(user1).initiateTransfer(
          ethers.ZeroAddress,
          amount,
          "+254712345678",
          "KE",
          "paypal", // Not supported
          { value: amount }
        )
      ).to.be.revertedWith("Provider not supported");

      // ETH amount mismatch
      await expect(
        ethSpenda.connect(user1).initiateTransfer(
          ethers.ZeroAddress,
          amount,
          "+254712345678",
          "KE",
          "mpesa",
          { value: ethers.parseEther("0.05") } // Different from amount
        )
      ).to.be.revertedWith("ETH amount mismatch");
    });

    it("Should calculate correct USD value", async function () {
      const { ethSpenda, user1 } = await loadFixture(deployEthSpendaFixture);

      const amount = ethers.parseEther("1"); // 1 ETH
      const expectedUsdValue = ethers.parseUnits("3250", 8); // $3250 with 8 decimals

      const usdValue = await ethSpenda.getUSDValue(ethers.ZeroAddress, amount);
      expect(usdValue).to.equal(expectedUsdValue);
    });
  });

  describe("ERC20 Token Transfers", function () {
    it("Should successfully initiate ERC20 transfer", async function () {
      const { ethSpenda, mockToken, user1 } = await loadFixture(deployEthSpendaFixture);

      // Setup price feed for mock token
      const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
      const tokenPriceFeed = await MockV3Aggregator.deploy(8, ethers.parseUnits("1", 8)); // $1 per token
      await ethSpenda.setPriceFeed(await mockToken.getAddress(), await tokenPriceFeed.getAddress());

      const amount = ethers.parseEther("100"); // 100 tokens
      const recipientPhone = "+254712345678";
      const countryCode = "KE";
      const providerCode = "mpesa";

      // Approve tokens
      await mockToken.connect(user1).approve(await ethSpenda.getAddress(), amount);

      const tx = await ethSpenda.connect(user1).initiateTransfer(
        await mockToken.getAddress(),
        amount,
        recipientPhone,
        countryCode,
        providerCode
      );

      const receipt = await tx.wait();
      const transferInitiatedEvent = receipt?.logs?.find(
        log => log.topics[0] === ethSpenda.interface.getEvent("TransferInitiated").topicHash
      );

      expect(transferInitiatedEvent).to.not.be.undefined;
      expect(await ethSpenda.totalTransactions()).to.equal(1);
      expect(await ethSpenda.getBalance(await mockToken.getAddress())).to.equal(amount);
    });

    it("Should revert ERC20 transfer without approval", async function () {
      const { ethSpenda, mockToken, user1 } = await loadFixture(deployEthSpendaFixture);

      // Setup price feed for mock token
      const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
      const tokenPriceFeed = await MockV3Aggregator.deploy(8, ethers.parseUnits("1", 8));
      await ethSpenda.setPriceFeed(await mockToken.getAddress(), await tokenPriceFeed.getAddress());

      const amount = ethers.parseEther("100");

      // Don't approve tokens
      await expect(
        ethSpenda.connect(user1).initiateTransfer(
          await mockToken.getAddress(),
          amount,
          "+254712345678",
          "KE",
          "mpesa"
        )
      ).to.be.reverted; // Should revert due to insufficient allowance
    });

    it("Should revert ERC20 transfer with ETH sent", async function () {
      const { ethSpenda, mockToken, user1 } = await loadFixture(deployEthSpendaFixture);

      const amount = ethers.parseEther("100");

      await expect(
        ethSpenda.connect(user1).initiateTransfer(
          await mockToken.getAddress(),
          amount,
          "+254712345678",
          "KE",
          "mpesa",
          { value: ethers.parseEther("0.1") } // Should not send ETH with token transfer
        )
      ).to.be.revertedWith("ETH sent with token transfer");
    });
  });

  describe("Fee Management", function () {
    it("Should collect platform fees correctly", async function () {
      const { ethSpenda, feeCollector, user1, owner } = await loadFixture(deployEthSpendaFixture);

      // Set 1% fee
      await ethSpenda.connect(owner).setPlatformFeeRate(100); // 1% in basis points

      const amount = ethers.parseEther("1");
      const expectedFee = amount * BigInt(100) / BigInt(10000); // 1%
      const expectedAmount = amount - expectedFee;

      const initialFeeCollectorBalance = await ethers.provider.getBalance(feeCollector.address);

      await ethSpenda.connect(user1).initiateTransfer(
        ethers.ZeroAddress,
        amount,
        "+254712345678",
        "KE",
        "mpesa",
        { value: amount }
      );

      const finalFeeCollectorBalance = await ethers.provider.getBalance(feeCollector.address);
      const feeReceived = finalFeeCollectorBalance - initialFeeCollectorBalance;

      expect(feeReceived).to.equal(expectedFee);
      expect(await ethSpenda.getBalance(ethers.ZeroAddress)).to.equal(expectedAmount);
    });

    it("Should not allow fee rate above maximum", async function () {
      const { ethSpenda, owner } = await loadFixture(deployEthSpendaFixture);

      await expect(
        ethSpenda.connect(owner).setPlatformFeeRate(1000) // 10%, above 5% max
      ).to.be.revertedWith("Fee rate too high");
    });
  });

  describe("Transfer Completion", function () {
    it("Should allow operators to complete transfers", async function () {
      const { ethSpenda, operator, user1, owner } = await loadFixture(deployEthSpendaFixture);

      // Add operator
      await ethSpenda.connect(owner).addOperator(operator.address);

      // Initiate transfer
      const amount = ethers.parseEther("0.1");
      const tx = await ethSpenda.connect(user1).initiateTransfer(
        ethers.ZeroAddress,
        amount,
        "+254712345678",
        "KE",
        "mpesa",
        { value: amount }
      );

      const receipt = await tx.wait();
      const transferEvent = receipt?.logs?.find(
        log => log.topics[0] === ethSpenda.interface.getEvent("TransferInitiated").topicHash
      );

      // Get request ID from event
      const requestId = transferEvent?.topics[1];

      // Complete transfer
      const completeTx = await ethSpenda.connect(operator).completeTransfer(
        requestId!,
        true,
        "MPESA_REF_123456"
      );

      const completeReceipt = await completeTx.wait();
      const completeEvent = completeReceipt?.logs?.find(
        log => log.topics[0] === ethSpenda.interface.getEvent("TransferCompleted").topicHash
      );

      expect(completeEvent).to.not.be.undefined;
    });

    it("Should not allow non-operators to complete transfers", async function () {
      const { ethSpenda, user1, user2 } = await loadFixture(deployEthSpendaFixture);

      // Initiate transfer
      const amount = ethers.parseEther("0.1");
      const tx = await ethSpenda.connect(user1).initiateTransfer(
        ethers.ZeroAddress,
        amount,
        "+254712345678",
        "KE",
        "mpesa",
        { value: amount }
      );

      const receipt = await tx.wait();
      const transferEvent = receipt?.logs?.find(
        log => log.topics[0] === ethSpenda.interface.getEvent("TransferInitiated").topicHash
      );

      const requestId = transferEvent?.topics[1];

      // Try to complete transfer as non-operator
      await expect(
        ethSpenda.connect(user2).completeTransfer(requestId!, true, "MPESA_REF_123456")
      ).to.be.revertedWith("Not authorized operator");
    });
  });

  describe("Pause Functionality", function () {
    it("Should pause and unpause contract", async function () {
      const { ethSpenda, owner, user1 } = await loadFixture(deployEthSpendaFixture);

      // Pause contract
      await ethSpenda.connect(owner).pause();
      expect(await ethSpenda.paused()).to.be.true;

      // Try to initiate transfer while paused
      await expect(
        ethSpenda.connect(user1).initiateTransfer(
          ethers.ZeroAddress,
          ethers.parseEther("0.1"),
          "+254712345678",
          "KE",
          "mpesa",
          { value: ethers.parseEther("0.1") }
        )
      ).to.be.revertedWith("Pausable: paused");

      // Unpause contract
      await ethSpenda.connect(owner).unpause();
      expect(await ethSpenda.paused()).to.be.false;

      // Should work after unpause
      await ethSpenda.connect(user1).initiateTransfer(
        ethers.ZeroAddress,
        ethers.parseEther("0.1"),
        "+254712345678",
        "KE",
        "mpesa",
        { value: ethers.parseEther("0.1") }
      );
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow emergency withdrawal when paused", async function () {
      const { ethSpenda, owner, user1 } = await loadFixture(deployEthSpendaFixture);

      // Add some ETH to contract
      await ethSpenda.connect(user1).initiateTransfer(
        ethers.ZeroAddress,
        ethers.parseEther("1"),
        "+254712345678",
        "KE",
        "mpesa",
        { value: ethers.parseEther("1") }
      );

      // Pause contract
      await ethSpenda.connect(owner).pause();

      const withdrawAmount = ethers.parseEther("0.5");
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

      await ethSpenda.connect(owner).emergencyWithdraw(
        ethers.ZeroAddress,
        withdrawAmount,
        owner.address
      );

      expect(await ethSpenda.getBalance(ethers.ZeroAddress)).to.equal(
        ethers.parseEther("1") - withdrawAmount
      );
    });

    it("Should not allow emergency withdrawal when not paused", async function () {
      const { ethSpenda, owner } = await loadFixture(deployEthSpendaFixture);

      await expect(
        ethSpenda.connect(owner).emergencyWithdraw(
          ethers.ZeroAddress,
          ethers.parseEther("0.1"),
          owner.address
        )
      ).to.be.revertedWith("Pausable: not paused");
    });
  });

  describe("Statistics and View Functions", function () {
    it("Should track statistics correctly", async function () {
      const { ethSpenda, user1, user2 } = await loadFixture(deployEthSpendaFixture);

      // Initial stats
      let stats = await ethSpenda.getStats();
      expect(stats._totalTransactions).to.equal(0);
      expect(stats._totalVolumeUSD).to.equal(0);

      // Make transfers
      await ethSpenda.connect(user1).initiateTransfer(
        ethers.ZeroAddress,
        ethers.parseEther("1"),
        "+254712345678",
        "KE",
        "mpesa",
        { value: ethers.parseEther("1") }
      );

      await ethSpenda.connect(user2).initiateTransfer(
        ethers.ZeroAddress,
        ethers.parseEther("0.5"),
        "+234801234567",
        "NG",
        "opay",
        { value: ethers.parseEther("0.5") }
      );

      // Check updated stats
      stats = await ethSpenda.getStats();
      expect(stats._totalTransactions).to.equal(2);
      expect(stats._totalVolumeUSD).to.be.gt(0); // Should have some USD volume
    });

    it("Should return correct price information", async function () {
      const { ethSpenda } = await loadFixture(deployEthSpendaFixture);

      const [price, updatedAt] = await ethSpenda.getLatestPrice(ethers.ZeroAddress);
      expect(price).to.equal(ethers.parseUnits("3250", 8)); // $3250 with 8 decimals
      expect(updatedAt).to.be.gt(0);
    });
  });
});
