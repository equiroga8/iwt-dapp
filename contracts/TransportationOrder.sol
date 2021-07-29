// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import './TransportationOrderLogger.sol';

/**
 * @title Decentralized IDentity Management (DIDM) system
 * @author equiroga8 
 * This contract sirves as a purpose to store Digital Credentials (DC) 
 * and Decentralized IDentifiers (DID) for an Inland Waterway Transport 
 * (IWT) support dApp. It is used to authenticate any entity.
 **/
 
contract TransportationOrder {
    
    struct Participant {
        bytes32 uuid;
        address did;
    }
    
    struct PayableParticipant {
        bytes32 uuid;
        address payable did;
    }
    
    enum State {
        INITIAL, ASSIGNED, INSPECTED, ORIGIN_GAUGING, IN_TRANSIT, DESTINATION_GAUGING, COMPLETED, CANCELED
    }
    
    enum Goods {
        BULK, PIECE, HAZARDOUS
    }
    

    bytes5 public originPort;
    bytes5 public destinationPort;
    uint256 public deadline;
    uint256 public orderPayout;
    Goods public cargoType;
    uint256 public cargoLoad;
    bytes32 public cargoDetails;
    bytes32 public originGauge;
    bytes32 public destinationGauge;
    
    address public client;
    PayableParticipant public shipper;
    Participant public gaugingSensor;
    Participant public cargoInspector;
    State public orderState;
    
    address private verifier = address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
    TransportationOrderLogger private logger = TransportationOrderLogger(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);
    address private factory = address(0x5FbDB2315678afecb367f032d93F642f64180aa3);
    
    modifier isVerifier(address _address) {
        require(_address == verifier, "Only a verifier can call this function");
        _;
    }
    
     modifier isFactory(address _address) {
        require(_address == factory, "Only the factory contract can call this function");
        _;
    }
    
    
    constructor(bytes5 _originPort, bytes5 _destinationPort, uint256 _deadline, uint256 _orderPayout, Goods _cargoType, uint256 _cargoLoad) isFactory(msg.sender) payable {
        
        client = payable(tx.origin);
        originPort = _originPort;
        destinationPort = _destinationPort;
        orderPayout = _orderPayout;
        deadline = _deadline;
        cargoType = _cargoType;
        cargoLoad = _cargoLoad;
        orderState = State.INITIAL;
        
        logger.orderCreationRequestEvent(address(this));
        
    }
    
    function verificationResult(bool successful) public isVerifier(msg.sender) {
        if (successful) {
            logger.orderCreatedEvent(address(this), client); 
        } else {
            payable(client).transfer(orderPayout);
            orderState = State.CANCELED;
            logger.orderCanceledEvent(address(this), client); 
        }
    }
    
    /**
     * @notice Order is assigned to the shipper that requests it.
     */
     
    
    function requestShipperRole(bytes32 _uuid) public {
        require(shipper.did == address(0x0) && orderState == State.INITIAL);
        logger.orderAssignmentRequestEvent(address(this), msg.sender, _uuid);
    }
    
    function assignShipperRole(bytes32 _uuid, address payable _did) public isVerifier(msg.sender) {
        shipper = PayableParticipant(_uuid, _did);
        orderState = State.ASSIGNED;
        logger.orderAssignedEvent(address(this), _did);
    }
    
    /**
     * @notice Cargo Inspector
     */
    
    function requestInspectorRole(bytes32 _uuid) public {
        require(cargoInspector.did == address(0x0) && orderState == State.ASSIGNED);
        logger.inspectorRoleRequestEvent(address(this), msg.sender, _uuid);
    }
    
    function assignInsectorRole(bytes32 _uuid, address _did) public isVerifier(msg.sender) {
        cargoInspector = Participant(_uuid, _did);
        logger.inspectorRoleAssignedEvent(address(this), _did);
    }
    
    function registerInspectionReport(bytes32 _inspectionReport) public {
        require(cargoInspector.did == msg.sender && orderState == State.ASSIGNED);
        cargoDetails = _inspectionReport;
        orderState = State.INSPECTED;
    }
    
    
    /**
     * @notice Origin Gauging
     */

    function requestGaugerRole(bytes32 _uuid) public {
        require(gaugingSensor.did == address(0x0) && (orderState == State.ASSIGNED || orderState == State.INSPECTED));
        logger.gaugerRoleRequestEvent(address(this), msg.sender, _uuid);
    }
    
    function assignGaugerRole(bytes32 _uuid, address _did) public isVerifier(msg.sender) {
        gaugingSensor = Participant(_uuid, _did);
        logger.gaugerRoleAssignedEvent(address(this), msg.sender);
    }
    
    function registerOriginGaugeEmpty(bytes32 _originGaugeEmpty) public {
        require((gaugingSensor.did == msg.sender || shipper.did == msg.sender) 
            && (orderState == State.ASSIGNED || orderState == State.INSPECTED));
        originGauge = _originGaugeEmpty;
        if (msg.sender == shipper.did) {
            orderState = State.ORIGIN_GAUGING;
        }
    }
    
    function registerOriginGaugeFull(bytes32 _originGaugeFull) public {
        require((gaugingSensor.did == msg.sender || shipper.did == msg.sender) 
         && orderState == State.ORIGIN_GAUGING);
        originGauge = _originGaugeFull;
        if (msg.sender == shipper.did) {
            orderState = State.IN_TRANSIT;
        }
    }
    
    
    /**
     * @notice Destination gauging
     */
    
    
    function registerDestinationGaugeFull(bytes32 _destinationGaugeFull) public {
        require((gaugingSensor.did == msg.sender || shipper.did == msg.sender) 
            && orderState == State.IN_TRANSIT);
        destinationGauge = _destinationGaugeFull;
        if (msg.sender == shipper.did) {
            orderState = State.DESTINATION_GAUGING;
        }
    }
    
    function registerDestinationGaugeEmpty(bytes32 _destinationGaugeEmpty) public {
        require((gaugingSensor.did == msg.sender || shipper.did == msg.sender) 
         && orderState == State.DESTINATION_GAUGING);
        destinationGauge = _destinationGaugeEmpty;
        if (msg.sender == shipper.did) {
            orderState = State.COMPLETED;
        }
    }
    
    
     /**
     * @notice Paying the contract
     */
    
    
    function completeOrder() public {
        require(client == msg.sender && orderState == State.COMPLETED);
        payable(shipper.did).transfer(address(this).balance);
    }
    
    function cancelOrder() public isVerifier(msg.sender) {
        require(orderState != State.COMPLETED);
        orderState = State.CANCELED;
        payable(client).transfer(address(this).balance);
    }
    
}