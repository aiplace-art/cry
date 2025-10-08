const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Token Contract", function () {
  // Fixture to deploy the contract
  async function deployTokenFixture() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("CryptoToken", "CTK", ethers.parseEther("1000000"));

    return { token, owner, addr1, addr2, addr3 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct name and symbol", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.name()).to.equal("CryptoToken");
      expect(await token.symbol()).to.equal("CTK");
    });

    it("Should have 18 decimals by default", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.decimals()).to.equal(18);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

      // Transfer 50 tokens from owner to addr1
      await expect(token.transfer(addr1.address, ethers.parseEther("50")))
        .to.changeTokenBalances(token, [owner, addr1], [ethers.parseEther("-50"), ethers.parseEther("50")]);

      // Transfer 50 tokens from addr1 to addr2
      await expect(token.connect(addr1).transfer(addr2.address, ethers.parseEther("50")))
        .to.changeTokenBalances(token, [addr1, addr2], [ethers.parseEther("-50"), ethers.parseEther("50")]);
    });

    it("Should emit Transfer events", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);

      await expect(token.transfer(addr1.address, ethers.parseEther("50")))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, addr1.address, ethers.parseEther("50"));
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const initialOwnerBalance = await token.balanceOf(owner.address);

      await expect(
        token.connect(addr1).transfer(owner.address, ethers.parseEther("1"))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should fail to transfer to zero address", async function () {
      const { token } = await loadFixture(deployTokenFixture);

      await expect(
        token.transfer(ethers.ZeroAddress, ethers.parseEther("50"))
      ).to.be.revertedWith("ERC20: transfer to the zero address");
    });

    it("Should handle transfers of zero amount", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);

      await expect(token.transfer(addr1.address, 0))
        .to.emit(token, "Transfer")
        .withArgs(token.target, addr1.address, 0);
    });
  });

  describe("Allowances", function () {
    it("Should approve tokens for delegated transfer", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);

      await expect(token.approve(addr1.address, ethers.parseEther("100")))
        .to.emit(token, "Approval")
        .withArgs(owner.address, addr1.address, ethers.parseEther("100"));

      expect(await token.allowance(owner.address, addr1.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should transfer tokens using transferFrom", async function () {
      const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

      await token.approve(addr1.address, ethers.parseEther("100"));

      await expect(
        token.connect(addr1).transferFrom(owner.address, addr2.address, ethers.parseEther("50"))
      ).to.changeTokenBalances(token, [owner, addr2], [ethers.parseEther("-50"), ethers.parseEther("50")]);

      expect(await token.allowance(owner.address, addr1.address)).to.equal(ethers.parseEther("50"));
    });

    it("Should fail transferFrom if amount exceeds allowance", async function () {
      const { token, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

      await token.approve(addr1.address, ethers.parseEther("50"));

      await expect(
        token.connect(addr1).transferFrom(owner.address, addr2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should update allowance with increaseAllowance", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);

      await token.approve(addr1.address, ethers.parseEther("100"));
      await token.increaseAllowance(addr1.address, ethers.parseEther("50"));

      expect(await token.allowance(owner.address, addr1.address)).to.equal(ethers.parseEther("150"));
    });

    it("Should update allowance with decreaseAllowance", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);

      await token.approve(addr1.address, ethers.parseEther("100"));
      await token.decreaseAllowance(addr1.address, ethers.parseEther("30"));

      expect(await token.allowance(owner.address, addr1.address)).to.equal(ethers.parseEther("70"));
    });
  });

  describe("Minting and Burning", function () {
    it("Should mint new tokens", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const initialSupply = await token.totalSupply();

      await token.mint(addr1.address, ethers.parseEther("1000"));

      expect(await token.totalSupply()).to.equal(initialSupply + ethers.parseEther("1000"));
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));
    });

    it("Should only allow owner to mint", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);

      await expect(
        token.connect(addr1).mint(addr1.address, ethers.parseEther("1000"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should burn tokens", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      const initialSupply = await token.totalSupply();

      await token.burn(ethers.parseEther("100"));

      expect(await token.totalSupply()).to.equal(initialSupply - ethers.parseEther("100"));
    });

    it("Should fail to burn more than balance", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);

      await expect(
        token.connect(addr1).burn(ethers.parseEther("1"))
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should efficiently transfer tokens (gas benchmark)", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);

      const tx = await token.transfer(addr1.address, ethers.parseEther("100"));
      const receipt = await tx.wait();

      console.log(`Transfer gas used: ${receipt.gasUsed}`);
      expect(receipt.gasUsed).to.be.lessThan(100000);
    });

    it("Should efficiently approve tokens (gas benchmark)", async function () {
      const { token, addr1 } = await loadFixture(deployTokenFixture);

      const tx = await token.approve(addr1.address, ethers.parseEther("100"));
      const receipt = await tx.wait();

      console.log(`Approve gas used: ${receipt.gasUsed}`);
      expect(receipt.gasUsed).to.be.lessThan(50000);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum uint256 value", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      const maxUint256 = ethers.MaxUint256;

      await token.approve(addr1.address, maxUint256);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(maxUint256);
    });

    it("Should handle multiple rapid transfers", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);

      const transfers = [];
      for (let i = 0; i < 10; i++) {
        transfers.push(token.transfer(addr1.address, ethers.parseEther("1")));
      }

      await Promise.all(transfers);
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("10"));
    });

    it("Should maintain balance consistency across concurrent operations", async function () {
      const { token, owner, addr1, addr2, addr3 } = await loadFixture(deployTokenFixture);

      await token.transfer(addr1.address, ethers.parseEther("1000"));
      await token.transfer(addr2.address, ethers.parseEther("1000"));

      const initialTotalSupply = await token.totalSupply();

      // Concurrent transfers
      await Promise.all([
        token.connect(addr1).transfer(addr3.address, ethers.parseEther("100")),
        token.connect(addr2).transfer(addr3.address, ethers.parseEther("100"))
      ]);

      expect(await token.totalSupply()).to.equal(initialTotalSupply);
    });
  });
});
