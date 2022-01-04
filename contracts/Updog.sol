//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Updog is ERC20 {
    uint256 public price;

    constructor(uint256 initialPrice) ERC20("Updog", "UDG") {
        price = initialPrice;
    }

    function buy() public payable {
        _mint(msg.sender, 10 ** decimals());
    }
}
