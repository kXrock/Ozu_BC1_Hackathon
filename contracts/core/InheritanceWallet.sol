// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./BaseAccount.sol";
import "./EntryPoint.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IInheritanceWallet.sol";
import "../utils/InheritanceHelper.sol";

abstract contract InheritanceWallet is BaseAccount, IInheritanceWallet {
    using InheritanceHelper for address;
    using ECDSA for bytes32;

    struct Heir {
        address wallet;
        uint256 share;
        bool isActive;
        uint256 lastVerification;
    }
    
    address public owner;
    uint256 public lastActivity;
    uint256 public inheritanceDelay;
    mapping(address => Heir) public heirs;
    uint256 public totalShares;
    
    IEntryPoint private immutable _entryPoint;

    constructor(address _owner, uint256 _inheritanceDelay, IEntryPoint anEntryPoint) {
        owner = _owner;
        inheritanceDelay = _inheritanceDelay;
        lastActivity = block.timestamp;
        _entryPoint = anEntryPoint;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyHeir() {
        require(heirs[msg.sender].isActive, "Only heir can call this function");
        _;
    }
    
    function addHeir(address _heir, uint256 _share) external onlyOwner {
        require(_heir != address(0), "Invalid heir address");
        require(_share > 0 && _share <= 100, "Invalid share percentage");
        require(totalShares + _share <= 100, "Total shares cannot exceed 100%");
        
        heirs[_heir] = Heir({
            wallet: _heir,
            share: _share,
            isActive: true,
            lastVerification: block.timestamp
        });
        
        totalShares += _share;
    }
    
    function updateLastActivity() external onlyOwner {
        lastActivity = block.timestamp;
    }
    
    function claimInheritance() external onlyHeir {
        require(block.timestamp > lastActivity + inheritanceDelay, "Owner still active");
        
        Heir storage heir = heirs[msg.sender];
        uint256 inheritanceAmount = (address(this).balance * heir.share) / 100;
        
        heir.isActive = false; // Prevent multiple claims
        payable(msg.sender).transfer(inheritanceAmount);
    }
    
    // ERC-4337 gereksinimleri
    function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 missingAccountFunds)
        external virtual override returns (uint256 validationData) {
        _validateSignature(userOp, userOpHash);
        _payPrefund(missingAccountFunds);
        return 0;
    }

    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash) 
        internal view returns (uint256) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        require(owner == hash.recover(userOp.signature), "Invalid signature");
    }

    function _payPrefund(uint256 missingAccountFunds) internal {
        if (missingAccountFunds != 0) {
            (bool success,) = payable(msg.sender).call{value: missingAccountFunds}("");
            require(success, "Transfer failed");
        }
    }
} 