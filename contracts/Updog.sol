//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Updog is ERC20 {
    uint256 public price;

    uint256 private _priceStep;

    constructor(uint256 initialPrice, uint256 priceStep) ERC20("Updog", "UDG") {
        price = initialPrice;
        _priceStep = priceStep;
    }

    function buy() public payable {
        require(msg.value >= price, "not enough ETH provided");

        _mint(msg.sender, 10 ** decimals());
        raisePrice();
    }

    function raisePrice() private {
        price += _priceStep;
    }
}
