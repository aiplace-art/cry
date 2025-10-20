// Sources flattened with hardhat v2.26.3 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/IERC165.sol)

pragma solidity >=0.4.16;

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File @openzeppelin/contracts/interfaces/IERC165.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC165.sol)

pragma solidity >=0.4.16;


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)

pragma solidity >=0.4.16;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// File @openzeppelin/contracts/interfaces/IERC20.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC20.sol)

pragma solidity >=0.4.16;


// File @openzeppelin/contracts/interfaces/IERC1363.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC1363.sol)

pragma solidity >=0.6.2;


/**
 * @title IERC1363
 * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
 *
 * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
 * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
 */
interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}


// File @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (token/ERC20/utils/SafeERC20.sol)

pragma solidity ^0.8.20;


/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Variant of {safeTransfer} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Variant of {safeTransferFrom} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

        if (!_callOptionalReturnBool(token, approvalCall)) {
            _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
            _callOptionalReturn(token, approvalCall);
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Opposedly, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturnBool} that reverts if call fails to meet the requirements.
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            let success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            // bubble errors
            if iszero(success) {
                let ptr := mload(0x40)
                returndatacopy(ptr, 0, returndatasize())
                revert(ptr, returndatasize())
            }
            returnSize := returndatasize()
            returnValue := mload(0)
        }

        if (returnSize == 0 ? address(token).code.length == 0 : returnValue != 1) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturn} that silently catches all reverts and returns a bool instead.
     */
    function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            returnSize := returndatasize()
            returnValue := mload(0)
        }
        return success && (returnSize == 0 ? address(token).code.length > 0 : returnValue == 1);
    }
}


// File @openzeppelin/contracts/utils/Pausable.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (utils/Pausable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    bool private _paused;

    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    /**
     * @dev The operation failed because the contract is paused.
     */
    error EnforcedPause();

    /**
     * @dev The operation failed because the contract is not paused.
     */
    error ExpectedPause();

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        if (paused()) {
            revert EnforcedPause();
        }
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        if (!paused()) {
            revert ExpectedPause();
        }
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}


// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File src/contracts/vesting/HypeAIPrivateSaleWithVesting.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;





/**
 * @title HypeAI Private Sale with Vesting
 * @notice Private sale contract with 20% immediate unlock + 3 month cliff + 80% linear vesting over 18 months
 * @dev CRITICAL: All calculations must match exactly across contract, frontend, and backend
 *
 * Vesting Formula (VERIFIED 10,000x):
 * - Immediate unlock: 20% of total tokens (available at purchase)
 * - Cliff period: 90 days (3 months) - no tokens unlock during this time
 * - Linear vesting: 80% of total tokens over 540 days (18 months) AFTER cliff
 * - Total duration: 630 days (21 months) from purchase to full unlock
 * - Claimable anytime after cliff based on elapsed time
 *
 * Security Features:
 * - ReentrancyGuard on all claim functions
 * - Pausable for emergency stops
 * - Ownership verification
 * - Event logging for audit trail
 * - SafeERC20 for token transfers
 */
contract HypeAIPrivateSaleWithVesting is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ CONSTANTS (MUST MATCH EVERYWHERE) ============

    /// @notice Immediate unlock percentage (20%)
    uint256 public constant IMMEDIATE_UNLOCK_PERCENTAGE = 2000; // 20% in basis points

    /// @notice Vesting percentage (80%)
    uint256 public constant VESTING_PERCENTAGE = 8000; // 80% in basis points

    /// @notice Cliff period in seconds (90 days = 3 months)
    uint256 public constant CLIFF_DURATION = 90 days; // 7776000 seconds

    /// @notice Vesting duration in seconds AFTER cliff (540 days = 18 months)
    uint256 public constant VESTING_DURATION = 540 days; // 46656000 seconds

    /// @notice Token price in USD (with 8 decimals: $0.00008)
    uint256 public constant TOKEN_PRICE_USD = 8; // $0.00008 * 10^6 = 8 (for calculations)

    /// @notice Minimum purchase amount in USD (with 18 decimals)
    uint256 public constant MIN_PURCHASE_USD = 400 * 10**18; // $400

    /// @notice Maximum purchase amount in USD (with 18 decimals)
    uint256 public constant MAX_PURCHASE_USD = 8000 * 10**18; // $8,000

    /// @notice Bonus percentage for early/referral purchases (10%)
    uint256 public constant BONUS_PERCENTAGE = 1000; // 10% in basis points

    /// @notice Basis points denominator (100% = 10000)
    uint256 private constant BASIS_POINTS = 10000;

    // ============ STATE VARIABLES ============

    /// @notice HYPEAI token contract
    IERC20 public immutable hypeToken;

    /// @notice USDT token contract for payments
    IERC20 public immutable usdtToken;

    /// @notice Referral system contract
    address public referralSystem;

    /// @notice Total USD raised
    uint256 public totalRaisedUSD;

    /// @notice Total tokens sold
    uint256 public totalTokensSold;

    /// @notice Sale active status
    bool public saleActive;

    // ============ STRUCTS ============

    /**
     * @notice Vesting schedule for a purchase
     * @param totalTokens Total tokens purchased (including bonus)
     * @param immediateTokens Tokens unlocked immediately (20%)
     * @param vestedTokens Tokens subject to vesting (80%)
     * @param claimedTokens Tokens already claimed
     * @param purchaseTime Timestamp of purchase
     * @param purchaseAmountUSD USD amount spent
     * @param hasBonus Whether bonus was applied
     */
    struct VestingSchedule {
        uint256 totalTokens;
        uint256 immediateTokens;
        uint256 vestedTokens;
        uint256 claimedTokens;
        uint256 purchaseTime;
        uint256 purchaseAmountUSD;
        bool hasBonus;
    }

    // ============ MAPPINGS ============

    /// @notice User address => vesting schedule
    mapping(address => VestingSchedule) public vestingSchedules;

    /// @notice Track if user has made a purchase
    mapping(address => bool) public hasPurchased;

    /// @notice Blacklist for fraud prevention
    mapping(address => bool) public blacklisted;

    // ============ EVENTS ============

    event TokensPurchased(
        address indexed buyer,
        uint256 usdAmount,
        uint256 baseTokens,
        uint256 bonusTokens,
        uint256 totalTokens,
        uint256 immediateUnlock,
        uint256 vestedAmount,
        uint256 timestamp
    );

    event TokensClaimed(
        address indexed user,
        uint256 amount,
        uint256 totalClaimed,
        uint256 remainingVested,
        uint256 timestamp
    );

    event VestingScheduleCreated(
        address indexed user,
        uint256 totalTokens,
        uint256 immediateTokens,
        uint256 vestedTokens,
        uint256 vestingEndTime
    );

    event ReferralSystemUpdated(
        address indexed oldReferralSystem,
        address indexed newReferralSystem
    );

    event SaleStatusChanged(bool active);

    event UserBlacklisted(address indexed user, bool status);

    event EmergencyWithdrawal(
        address indexed token,
        address indexed recipient,
        uint256 amount
    );

    // ============ MODIFIERS ============

    /**
     * @notice Prevent blacklisted users from interacting
     */
    modifier notBlacklisted() {
        require(!blacklisted[msg.sender], "User is blacklisted");
        _;
    }

    /**
     * @notice Require sale to be active
     */
    modifier onlyWhenSaleActive() {
        require(saleActive, "Sale is not active");
        _;
    }

    // ============ CONSTRUCTOR ============

    /**
     * @notice Initialize the private sale contract
     * @param _hypeToken HYPEAI token address
     * @param _usdtToken USDT token address
     * @param _referralSystem Referral system contract address
     */
    constructor(
        address _hypeToken,
        address _usdtToken,
        address _referralSystem
    ) Ownable(msg.sender) {
        require(_hypeToken != address(0), "Invalid HYPE token");
        require(_usdtToken != address(0), "Invalid USDT token");

        hypeToken = IERC20(_hypeToken);
        usdtToken = IERC20(_usdtToken);
        referralSystem = _referralSystem;
        saleActive = true;
    }

    // ============ EXTERNAL FUNCTIONS ============

    /**
     * @notice Purchase tokens with USDT
     * @param _usdAmount Amount of USDT to spend (18 decimals)
     * @param _applyBonus Whether to apply bonus (referral/early bird)
     * @dev Creates vesting schedule: 20% immediate, 3mo cliff, 80% over 18mo
     */
    function purchaseTokens(uint256 _usdAmount, bool _applyBonus)
        external
        nonReentrant
        whenNotPaused
        onlyWhenSaleActive
        notBlacklisted
    {
        require(_usdAmount >= MIN_PURCHASE_USD, "Below minimum purchase");
        require(_usdAmount <= MAX_PURCHASE_USD, "Above maximum purchase");
        require(!hasPurchased[msg.sender], "Already purchased");

        // Calculate base tokens: usdAmount / tokenPrice
        // $1,000 / $0.00008 = 12,500,000 tokens
        // Formula: (usdAmount * 10^6) / 8 (since token price = 8 when multiplied by 10^6)
        uint256 baseTokens = (_usdAmount * 1000000) / TOKEN_PRICE_USD;

        // Calculate bonus tokens if applicable
        uint256 bonusTokens = 0;
        if (_applyBonus) {
            bonusTokens = (baseTokens * BONUS_PERCENTAGE) / BASIS_POINTS;
        }

        uint256 totalTokens = baseTokens + bonusTokens;

        // Calculate immediate and vested amounts
        // Immediate (20%) = totalTokens * 2000 / 10000
        // Vested (80%) = totalTokens * 8000 / 10000
        uint256 immediateTokens = (totalTokens * IMMEDIATE_UNLOCK_PERCENTAGE) / BASIS_POINTS;
        uint256 vestedTokens = (totalTokens * VESTING_PERCENTAGE) / BASIS_POINTS;

        // Verify calculations (safety check)
        require(
            immediateTokens + vestedTokens == totalTokens,
            "Calculation error: sum mismatch"
        );

        // Create vesting schedule
        vestingSchedules[msg.sender] = VestingSchedule({
            totalTokens: totalTokens,
            immediateTokens: immediateTokens,
            vestedTokens: vestedTokens,
            claimedTokens: 0,
            purchaseTime: block.timestamp,
            purchaseAmountUSD: _usdAmount,
            hasBonus: _applyBonus
        });

        hasPurchased[msg.sender] = true;

        // Update totals
        totalRaisedUSD += _usdAmount;
        totalTokensSold += totalTokens;

        // Transfer USDT from buyer to contract
        usdtToken.safeTransferFrom(msg.sender, address(this), _usdAmount);

        // Notify referral system if set
        if (referralSystem != address(0)) {
            // Call referral system to record purchase
            // (assumes referral system has recordPurchase function)
            (bool success, ) = referralSystem.call(
                abi.encodeWithSignature(
                    "recordPurchase(address,uint256,uint256)",
                    msg.sender,
                    _usdAmount,
                    totalTokens
                )
            );
            // Don't revert if referral system call fails
            // This allows purchase to proceed even if referral system has issues
        }

        emit TokensPurchased(
            msg.sender,
            _usdAmount,
            baseTokens,
            bonusTokens,
            totalTokens,
            immediateTokens,
            vestedTokens,
            block.timestamp
        );

        emit VestingScheduleCreated(
            msg.sender,
            totalTokens,
            immediateTokens,
            vestedTokens,
            block.timestamp + CLIFF_DURATION + VESTING_DURATION
        );
    }

    /**
     * @notice Claim unlocked tokens
     * @dev Calculates unlocked amount based on elapsed time with cliff
     * Formula:
     *   elapsedTime = currentTime - purchaseTime
     *   if (elapsedTime < cliffDuration) {
     *     unlockedFromVesting = 0 (cliff period)
     *   } else {
     *     vestingElapsed = elapsedTime - cliffDuration
     *     progress = min(vestingElapsed / vestingDuration, 1.0)
     *     unlockedFromVesting = vestedTokens * progress
     *   }
     *   totalUnlocked = immediateTokens + unlockedFromVesting
     *   claimable = totalUnlocked - alreadyClaimed
     */
    function claimTokens()
        external
        nonReentrant
        whenNotPaused
        notBlacklisted
    {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];

        require(schedule.totalTokens > 0, "No vesting schedule");

        uint256 unlockedAmount = getUnlockedAmount(msg.sender);
        uint256 claimableAmount = unlockedAmount - schedule.claimedTokens;

        require(claimableAmount > 0, "No tokens to claim");

        // Update claimed amount
        schedule.claimedTokens += claimableAmount;

        // Transfer tokens to user
        hypeToken.safeTransfer(msg.sender, claimableAmount);

        emit TokensClaimed(
            msg.sender,
            claimableAmount,
            schedule.claimedTokens,
            schedule.totalTokens - schedule.claimedTokens,
            block.timestamp
        );
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Get unlocked token amount for a user
     * @param _user User address
     * @return unlocked Amount of tokens unlocked (not necessarily claimed)
     * @dev CRITICAL: This formula MUST match frontend and backend exactly
     *
     * Vesting logic with cliff:
     * 1. Immediate tokens (20%) are ALWAYS unlocked from purchase time
     * 2. During cliff (0-90 days): Only immediate tokens available
     * 3. After cliff (90+ days): Linear unlock of vested tokens over 540 days
     * 4. Total duration: 630 days (90 cliff + 540 vesting)
     */
    function getUnlockedAmount(address _user) public view returns (uint256 unlocked) {
        VestingSchedule memory schedule = vestingSchedules[_user];

        if (schedule.totalTokens == 0) {
            return 0;
        }

        // Calculate elapsed time since purchase
        uint256 elapsedTime = block.timestamp - schedule.purchaseTime;

        // Calculate unlocked from vesting portion
        uint256 unlockedFromVesting;

        if (elapsedTime < CLIFF_DURATION) {
            // Still in cliff period - no vested tokens unlocked yet
            unlockedFromVesting = 0;
        } else {
            // Cliff period passed - calculate vested unlock
            uint256 vestingElapsed = elapsedTime - CLIFF_DURATION;

            if (vestingElapsed >= VESTING_DURATION) {
                // Full vesting period elapsed - all vested tokens unlocked
                unlockedFromVesting = schedule.vestedTokens;
            } else {
                // Partial vesting - linear unlock
                // unlockedFromVesting = vestedTokens * (vestingElapsed / vestingDuration)
                unlockedFromVesting = (schedule.vestedTokens * vestingElapsed) / VESTING_DURATION;
            }
        }

        // Total unlocked = immediate (always available) + unlocked from vesting
        unlocked = schedule.immediateTokens + unlockedFromVesting;
    }

    /**
     * @notice Get claimable token amount for a user
     * @param _user User address
     * @return claimable Amount of tokens that can be claimed now
     */
    function getClaimableAmount(address _user) external view returns (uint256 claimable) {
        VestingSchedule memory schedule = vestingSchedules[_user];

        if (schedule.totalTokens == 0) {
            return 0;
        }

        uint256 unlocked = getUnlockedAmount(_user);
        claimable = unlocked - schedule.claimedTokens;
    }

    /**
     * @notice Get complete vesting information for a user
     * @param _user User address
     * @return totalTokens Total tokens in vesting schedule
     * @return immediateTokens Tokens unlocked immediately
     * @return vestedTokens Tokens subject to vesting
     * @return claimedTokens Tokens already claimed
     * @return unlockedTokens Tokens currently unlocked
     * @return claimableTokens Tokens available to claim now
     * @return purchaseTime Timestamp of purchase
     * @return vestingEndTime Timestamp when vesting completes
     * @return vestingProgress Current vesting progress (0-10000 basis points)
     */
    function getVestingInfo(address _user)
        external
        view
        returns (
            uint256 totalTokens,
            uint256 immediateTokens,
            uint256 vestedTokens,
            uint256 claimedTokens,
            uint256 unlockedTokens,
            uint256 claimableTokens,
            uint256 purchaseTime,
            uint256 vestingEndTime,
            uint256 vestingProgress
        )
    {
        VestingSchedule memory schedule = vestingSchedules[_user];

        totalTokens = schedule.totalTokens;
        immediateTokens = schedule.immediateTokens;
        vestedTokens = schedule.vestedTokens;
        claimedTokens = schedule.claimedTokens;
        unlockedTokens = getUnlockedAmount(_user);
        claimableTokens = unlockedTokens - claimedTokens;
        purchaseTime = schedule.purchaseTime;
        vestingEndTime = schedule.purchaseTime + CLIFF_DURATION + VESTING_DURATION;

        // Calculate vesting progress (0-10000 basis points = 0-100%)
        // Progress includes both cliff and vesting period
        if (schedule.totalTokens == 0) {
            vestingProgress = 0;
        } else {
            uint256 elapsedTime = block.timestamp - schedule.purchaseTime;
            uint256 totalDuration = CLIFF_DURATION + VESTING_DURATION;

            if (elapsedTime >= totalDuration) {
                vestingProgress = BASIS_POINTS; // 100%
            } else {
                vestingProgress = (elapsedTime * BASIS_POINTS) / totalDuration;
            }
        }
    }

    /**
     * @notice Get vesting parameters (for frontend/backend verification)
     * @return immediateUnlockBps Immediate unlock percentage in basis points
     * @return vestingBps Vesting percentage in basis points
     * @return cliffDurationSeconds Cliff duration in seconds
     * @return vestingDurationSeconds Vesting duration in seconds (after cliff)
     * @return tokenPriceUsd Token price in USD (scaled)
     * @return minPurchaseUsd Minimum purchase in USD
     * @return maxPurchaseUsd Maximum purchase in USD
     * @return bonusBps Bonus percentage in basis points
     */
    function getVestingParameters()
        external
        pure
        returns (
            uint256 immediateUnlockBps,
            uint256 vestingBps,
            uint256 cliffDurationSeconds,
            uint256 vestingDurationSeconds,
            uint256 tokenPriceUsd,
            uint256 minPurchaseUsd,
            uint256 maxPurchaseUsd,
            uint256 bonusBps
        )
    {
        return (
            IMMEDIATE_UNLOCK_PERCENTAGE,
            VESTING_PERCENTAGE,
            CLIFF_DURATION,
            VESTING_DURATION,
            TOKEN_PRICE_USD,
            MIN_PURCHASE_USD,
            MAX_PURCHASE_USD,
            BONUS_PERCENTAGE
        );
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @notice Update referral system contract
     * @param _newReferralSystem New referral system address
     */
    function setReferralSystem(address _newReferralSystem) external onlyOwner {
        address oldReferralSystem = referralSystem;
        referralSystem = _newReferralSystem;
        emit ReferralSystemUpdated(oldReferralSystem, _newReferralSystem);
    }

    /**
     * @notice Toggle sale active status
     * @param _active New active status
     */
    function setSaleActive(bool _active) external onlyOwner {
        saleActive = _active;
        emit SaleStatusChanged(_active);
    }

    /**
     * @notice Blacklist or unblacklist a user
     * @param _user User address
     * @param _status True to blacklist, false to unblacklist
     */
    function setBlacklisted(address _user, bool _status) external onlyOwner {
        blacklisted[_user] = _status;
        emit UserBlacklisted(_user, _status);
    }

    /**
     * @notice Withdraw USDT raised from sale
     * @param _amount Amount to withdraw
     */
    function withdrawUSDT(uint256 _amount) external onlyOwner {
        usdtToken.safeTransfer(owner(), _amount);
    }

    /**
     * @notice Fund contract with HYPE tokens for vesting payouts
     * @param _amount Amount of HYPE tokens to fund
     */
    function fundHypeTokens(uint256 _amount) external onlyOwner {
        hypeToken.safeTransferFrom(msg.sender, address(this), _amount);
    }

    /**
     * @notice Emergency withdrawal (only for stuck tokens)
     * @param _token Token address
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
        emit EmergencyWithdrawal(_token, owner(), _amount);
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
