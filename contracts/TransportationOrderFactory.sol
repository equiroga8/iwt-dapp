// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import './TransportationOrder.sol';

/**
 * @title Transport Order Factory
 * @author equiroga8 
 * This contract creates and keeps a record of all the transport orders that are generated.
 **/
 
contract TransportationOrderFactory {
    
    address[] public transportOrders;
    
    
    function createTransportOrder(bytes5 _originPort, bytes5 _destinationPort, uint256 _cutOffDate, TransportationOrder.Goods _cargoType) payable public returns (address transportationOrder) {
        
        address newTransportOrder = address((new TransportationOrder){value: msg.value}(_originPort, _destinationPort, _cutOffDate, msg.value,  _cargoType));
        transportOrders.push(newTransportOrder);
        return newTransportOrder;
    }
    
    function getTransportOrders() public view returns(address[] memory _transportOrders) {
        return transportOrders;
    }

}