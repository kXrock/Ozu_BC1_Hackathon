// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

library InheritanceHelper {
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
    
    function calculateInheritanceShare(uint256 totalAmount, uint256 share) internal pure returns (uint256) {
        return (totalAmount * share) / 100;
    }
} 