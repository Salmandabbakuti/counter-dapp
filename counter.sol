// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract Counter {
    uint public count;

    // Function to get the current count
    event Count(string method, uint count, address caller);
    function getCount() public view returns (uint) {
        return count;
    }

    // Function to increment count by 1
    function increment() public {
        count++;
        emit Count('Increment', count, msg.sender);
    }

    // Function to decrement count by 1
    function decrement() public {
        count--;
        emit Count('decrement', count, msg.sender);
    }
}