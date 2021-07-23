// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;



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
    
    address private verifier = address(0x9F785A6d956998DEA3d43F204Ac028e007928a6A);
    address public client;
    PayableParticipant public shipper;
    Participant public gaugingSensor;
    Participant public cargoInspector;
    State public orderState;
    
    modifier isVerifier(address _address) {
        require(_address == verifier, "Only a verifier can call this function");
        _;
    }
    
    event ValidateClientDID(address _did);
    event OrderCreated(address _did);
    event OrderCanceled(address _did);
    
    constructor(bytes5 _originPort, bytes5 _destinationPort, uint256 _deadline, uint256 _orderPayout, Goods _cargoType, uint256 _cargoLoad) payable {
        // constructor should only be called by the factory.
        client = payable(tx.origin);
        originPort = _originPort;
        destinationPort = _destinationPort;
        orderPayout = _orderPayout;
        deadline = _deadline;
        cargoType = _cargoType;
        cargoLoad = _cargoLoad;
        orderState = State.INITIAL;
        
        emit ValidateClientDID(client);
        
    }
    
    
    function verificationResult(bool successful) public isVerifier(msg.sender) {
        if (successful) {
            emit OrderCreated(client); 
        } else {
            payable(client).transfer(orderPayout);
            orderState = State.CANCELED;
            emit OrderCanceled(client); 
        }
    }
    
    /**
     * @notice Order is assigned to the shipper that requests it.
     */
     
    event OrderAssignmentRequest(address _did, bytes32 uuid);
    event OrderAssigned(address _did);
    
    function requestShipperRole(bytes32 _uuid) public {
        require(shipper.did == address(0x0) && orderState == State.INITIAL);
        emit OrderAssignmentRequest(msg.sender, _uuid);
    }
    
    function assignShipperRole(bytes32 _uuid, address payable _did) public isVerifier(msg.sender) {
        shipper = PayableParticipant(_uuid, _did);
        orderState = State.ASSIGNED;
        emit OrderAssigned(_did);
    }
    
    /**
     * @notice Cargo Inspector
     */
    
    event InspectorRoleRequested(address _did, bytes32 uuid);
    event InspectorRoleAssigned(address _did);
    
    function requestInspectorRole(bytes32 _uuid) public {
        require(cargoInspector.did == address(0x0) && orderState == State.ASSIGNED);
        emit InspectorRoleRequested(msg.sender, _uuid);
    }
    
    function assignInsectorRole(bytes32 _uuid, address _did) public isVerifier(msg.sender) {
        cargoInspector = Participant(_uuid, _did);
        emit InspectorRoleAssigned(_did);
    }
    
    function registerInspectionReport(bytes32 _inspectionReport) public {
        require(cargoInspector.did == msg.sender && orderState == State.ASSIGNED);
        cargoDetails = _inspectionReport;
        orderState = State.INSPECTED;
        
    }
    
    
    /**
     * @notice Origin Gauging
     */
    
    event GaugerRoleRequested(address _did, bytes32 uuid);
    event GaugerRoleAssigned(address _did);
    
    function requestGaugerRole(bytes32 _uuid) public {
        require(gaugingSensor.did == address(0x0) && (orderState == State.ASSIGNED || orderState == State.INSPECTED));
        emit GaugerRoleRequested(msg.sender, _uuid);
    }
    
    function assignGaugerRole(bytes32 _uuid, address _did) public isVerifier(msg.sender) {
        gaugingSensor = Participant(_uuid, _did);
        emit GaugerRoleAssigned(_did);
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