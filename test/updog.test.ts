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

    const buyAtCurrentPrice = async () => {
      const currentPrice = await updog.price()
      await updog.buy({ value: currentPrice })
    }

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

    it("excess ETH is refunded after purchase", async () => {
      const currentPrice = await updog.price()
      const extra = 1500
      const providedEth = currentPrice.add(extra)

      const purchase = await updog.buy({ value: providedEth })

      await expect(purchase).to.changeEtherBalance(wallets.alice, -currentPrice)
    })

    it("purchase costs less than 100000 gas", async () => {
      const currentPrice = await updog.price()

      const tx = await updog.buy({ value: currentPrice })
      const result = await tx.wait()

      expect(result.gasUsed).to.be.lt(100000)
    })

    it("can read historic prices", async () => {
      await buyAtCurrentPrice()
      await buyAtCurrentPrice()

      const record1 = await updog.priceHistory(0)
      const record2 = await updog.priceHistory(1)

      expect(record1.price).to.eq(eth(1, "gwei"))
      expect(record2.price).to.eq(eth(2, "gwei"))

      expect(record1.timestamp).to.be.gt(0)
      expect(record2.timestamp).to.be.gt(0)

      expect(record2.timestamp).to.be.gt(record1.timestamp)
    })
  })
})
