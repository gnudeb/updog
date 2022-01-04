import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { BigNumber } from "ethers"
import { ethers } from "hardhat"
import { Updog } from "../typechain"

type EthUnit = "wei" | "gwei"

const ethUnitBases: Record<EthUnit, number> = {
  wei: 1,
  gwei: 9,
}

const eth = (amount: number, unit: EthUnit) =>
  BigNumber.from(10)
    .pow(ethUnitBases[unit])
    .mul(amount)

const updogs = (amount: number) => BigNumber.from(10).pow(18).mul(amount)

describe("Updog", function () {
  let wallets: {alice: SignerWithAddress; bob: SignerWithAddress}

  beforeEach(async () => {
    const [alice, bob] = await ethers.getSigners()
    wallets = { alice, bob }
  })

  describe("Deployed with initial price = 1 gwei, step = 1 gwei", () => {
    let updog: Updog
    const basePrice = eth(1, "gwei")
    const step = eth(1, "gwei")

    beforeEach(async () => {
      const Updog = await ethers.getContractFactory("Updog")
      updog = await Updog.deploy(basePrice, step)
      await updog.deployed()
    })

    it("can buy for initial price", async () => {
      await updog.buy({ value: basePrice })

      expect(await updog.balanceOf(wallets.alice.address)).to.equal(updogs(1))
    })

    it("can't buy for less than the current price", async () => {
      const currentPrice = await updog.price()
      const lowerPrice = currentPrice.sub(1)

      const purchaceAttempt = updog.buy({ value: lowerPrice })

      await expect(purchaceAttempt).to.be.revertedWith("not enough ETH provided")
    })

    it("price increases with each purchase", async () => {
      const priceBefore = await updog.price()
      await updog.buy({ value: priceBefore })
      const priceAfterPurchase = await updog.price()

      expect(priceAfterPurchase).to.be.gt(priceBefore)
    })
  })
})
