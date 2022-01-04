//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Updog is ERC20 {
    uint256 public price;
    mapping(uint256 => uint256) public priceHistory;

    uint256 private _priceStep;

    constructor(uint256 initialPrice, uint256 priceStep) ERC20("Updog", "UDG") {
        price = initialPrice;
        _priceStep = priceStep;
    }

    function buy() public payable {
        require(msg.value >= price, "not enough ETH provided");

        _mint(msg.sender, 10 ** decimals());
        refundExtraEth();
        recordPrice();
        raisePrice();
    }

    function raisePrice() private {
        price += _priceStep;
    }

    function refundExtraEth() private {
        uint256 extraEthProvided = msg.value - price;

        if (extraEthProvided > 0) {
            payable(msg.sender).transfer(extraEthProvided);
        }
    }

    function recordPrice() private {
        priceHistory[block.timestamp] = price;
    }
}
