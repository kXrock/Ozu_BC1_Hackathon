// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IInheritanceWallet {
    event HeirAdded(address indexed heir, uint256 share);
    event InheritanceClaimed(address indexed heir, uint256 amount);
    event ActivityUpdated(uint256 timestamp);

    function addHeir(address _heir, uint256 _share) external;
    function updateLastActivity() external;
    function claimInheritance() external;
} 