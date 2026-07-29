// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockDojangScroll {
    mapping(bytes32 key => bool verified) private _verified;

    function setVerified(address learner, bytes32 attesterId, bool verified) external {
        _verified[keccak256(abi.encode(learner, attesterId))] = verified;
    }

    function isVerified(address learner, bytes32 attesterId) external view returns (bool) {
        return _verified[keccak256(abi.encode(learner, attesterId))];
    }
}
