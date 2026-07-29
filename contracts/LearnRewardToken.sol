// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LearnRewardToken is ERC20 {
    constructor(address recipient) ERC20("GIWA Learn Test Reward", "gLEARN") {
        _mint(recipient, 1_000_000 ether);
    }
}
