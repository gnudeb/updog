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

  describe("Deployed with initial price of 1 gwei", () => {
    let updog: Updog
    const basePrice = eth(1, "gwei")

    beforeEach(async () => {
      const Updog = await ethers.getContractFactory("Updog")
      updog = await Updog.deploy(basePrice)
      await updog.deployed()
    })

    it("can buy for initial price", async () => {
      await updog.buy({ value: basePrice })

      expect(await updog.balanceOf(wallets.alice.address)).to.equal(updogs(1))
    })
  })
})
