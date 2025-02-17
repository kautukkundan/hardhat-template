import { ethers } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import { solidity } from "ethereum-waffle";
import { TestToken__factory } from "../typechain";

chai.use(solidity);
chai.use(chaiAsPromised);

const { expect } = chai;

describe("Token", () => {
  let tokenAddress: string;

  beforeEach(async () => {
    const [deployer, user] = await ethers.getSigners();
    const tokenFactory = new TestToken__factory(deployer);
    const tokenContract = await tokenFactory.deploy();
    tokenAddress = tokenContract.address;

    expect(await tokenContract.totalSupply()).to.eq(0);
  });

  describe("Mint", async () => {
    it("Should mint some tokens", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new TestToken__factory(deployer).attach(tokenAddress);
      const toMint = ethers.utils.parseEther("1");

      await tokenInstance.mint(user.address, toMint);
      expect(await tokenInstance.totalSupply()).to.eq(toMint);
    });
  });

  describe("Transfer", async () => {
    it("Should transfer tokens between users", async () => {
      const [deployer, sender, receiver] = await ethers.getSigners();
      const deployerInstance = new TestToken__factory(deployer).attach(tokenAddress);
      const toMint = ethers.utils.parseEther("1");

      await deployerInstance.mint(sender.address, toMint);
      expect(await deployerInstance.balanceOf(sender.address)).to.eq(toMint);

      const senderInstance = new TestToken__factory(sender).attach(tokenAddress);
      const toSend = ethers.utils.parseEther("0.4");
      await senderInstance.transfer(receiver.address, toSend);

      expect(await senderInstance.balanceOf(receiver.address)).to.eq(toSend);
    });
  });

  describe("Transfer Fail", async () => {
    it("Should fail transfer due to insufficient balance", async () => {
      const [deployer, sender, receiver] = await ethers.getSigners();
      const deployerInstance = new TestToken__factory(deployer).attach(tokenAddress);
      const toMint = ethers.utils.parseEther("1");

      await deployerInstance.mint(sender.address, toMint);
      expect(await deployerInstance.balanceOf(sender.address)).to.eq(toMint);

      const senderInstance = new TestToken__factory(sender).attach(tokenAddress);
      const toSend = ethers.utils.parseEther("2");

      expect(senderInstance.transfer(receiver.address, toSend)).to.be.rejectedWith(
        Error,
        "transfer amount exceeds balance",
      );
    });
  });
});
