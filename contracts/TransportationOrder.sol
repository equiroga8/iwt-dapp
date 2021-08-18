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
        INITIAL, 
        ASSIGNED, 
        INSPECTED_ORIGIN,
        REPORT_ORIGIN_SIGNED,
        ORIGIN_EMPTY_GAUGED,
        LOADED, 
        ORIGIN_FULL_GAUGED, 
        IN_TRANSIT, 
        INSPECTED_DESTINATION,
        REPORT_DESTINATION_SIGNED,
        DESTINATION_FULL_GAUGED,
        UNLOADED, 
        DESTINATION_EMPTY_GAUGED, 
        COMPLETED, 
        CANCELED
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
    bytes32 public cargoDetailsOrigin;
    bytes32 public cargoDetailsDestination;
    bytes32 public originGauge;
    bytes32 public destinationGauge;
    
    address public client;
    PayableParticipant public operator;
    Participant public gaugingSensor;
    Participant public cargoInspectorOrigin;
    Participant public cargoInspectorDestination;
    State public orderState;
    
    address private verifier = address(0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199);
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
            logger.orderVerificationResultEvent(address(this), client, true); 
        } else {
            payable(client).transfer(orderPayout);
            orderState = State.CANCELED;
            logger.orderVerificationResultEvent(address(this), client, false); 
        }
    }
    
    /**
     * @notice Order is assigned to the operator that requests it.
     */
     
    
    function requestOperatorRole(bytes32 _uuid) public {
        require(operator.did == address(0x0) && orderState == State.INITIAL);
        logger.orderAssignmentRequestEvent(address(this), msg.sender, _uuid);
    }
    
    function assignOperatorRole(bytes32 _uuid, address payable _did, bool _success) public isVerifier(msg.sender) {
        if (_success) {
            operator = PayableParticipant(_uuid, _did);
            orderState = State.ASSIGNED;
        }
        logger.orderAssignedEvent(address(this),_did, _success);
    }
    
    /**
     * @notice Cargo Inspection Origin
     */
    
    function requestOriginInspectorRole(bytes32 _uuid) public {
        require(cargoInspectorOrigin.did == address(0x0) && orderState == State.ASSIGNED);
        logger.inspectorOriginRoleRequestEvent(address(this), msg.sender, _uuid);
    }
    
    function assignOriginInspectorRole(bytes32 _uuid, address _did, bool _success) public isVerifier(msg.sender) {
        if (_success) {
            cargoInspectorOrigin = Participant(_uuid, _did);
        }
        logger.inspectorOriginRoleAssignedEvent(address(this), _did, _success);
    }
    
    function registerOriginInspectionReport(bytes32 _inspectionReport) public {
        require(cargoInspectorOrigin.did == msg.sender && orderState == State.ASSIGNED);
        cargoDetailsOrigin = _inspectionReport;
        orderState = State.INSPECTED_ORIGIN;
    }

    function signOriginInspectionReport(bytes32 _signedInspectionReport) public {
        require(operator.did == msg.sender && orderState == State.INSPECTED_ORIGIN);
        cargoDetailsOrigin = _signedInspectionReport;
        orderState = State.REPORT_ORIGIN_SIGNED;
    }
    
    
    /**
     * @notice Origin Gauging
     */

    function requestGaugerRole(bytes32 _uuid) public {
        require(gaugingSensor.did == address(0x0) && (orderState == State.ASSIGNED || orderState == State.REPORT_ORIGIN_SIGNED));
        logger.gaugerRoleRequestEvent(address(this), msg.sender, _uuid);
    }
    
    function assignGaugerRole(bytes32 _uuid, address _did, bool _success) public isVerifier(msg.sender) {
        if (_success) {
            gaugingSensor = Participant(_uuid, _did);
        }
        logger.gaugerRoleAssignedEvent(address(this), _did, _success);
    }

    function requestGauging() public {
        require(msg.sender == operator.did && 
            (orderState == State.ASSIGNED || orderState == State.REPORT_ORIGIN_SIGNED 
            || orderState == State.IN_TRANSIT || orderState == State.REPORT_ORIGIN_SIGNED 
            || orderState == State.LOADED || orderState == State.UNLOADED),
            'Only the operator can request the gauge.');
        logger.gaugeRequestedEvent(address(this), gaugingSensor.did);
    }
    
    function registerOriginGaugeEmpty(bytes32 _originGaugeEmpty) public {
        require(gaugingSensor.did == msg.sender 
            && (orderState == State.ASSIGNED || orderState == State.REPORT_ORIGIN_SIGNED),
            'Only gauger can submit a measurement');
        originGauge = _originGaugeEmpty;
        orderState = State.ORIGIN_EMPTY_GAUGED;
        logger.originEmptyGaugeRegisteredEvent(address(this));
    }

    function signOriginGauge(bytes32 _signedMeasurement, bool _isEmptyMeasurement) public {
        require(operator.did == msg.sender 
            && (orderState == State.ORIGIN_EMPTY_GAUGED || orderState == State.ORIGIN_FULL_GAUGED),
            'Only the operator can sign gauge details');
        originGauge = _signedMeasurement;
        if(_isEmptyMeasurement) {
            orderState = State.LOADED;
        } else {
            orderState = State.IN_TRANSIT;
        }       
    }
    
    function registerOriginGaugeFull(bytes32 _originGaugeFull) public {
        require(gaugingSensor.did == msg.sender
         && orderState == State.LOADED,'Only gauger can submit a measurement');
        originGauge = _originGaugeFull;
        orderState = State.ORIGIN_FULL_GAUGED;
        logger.originFullGaugeRegisteredEvent(address(this));
    }



    /**
     * @notice Destination gauging
     */
    
    function registerDestinationGaugeFull(bytes32 _destinationGaugeFull) public {
        require(gaugingSensor.did == msg.sender 
            && (orderState == State.IN_TRANSIT || orderState == State.REPORT_DESTINATION_SIGNED));
        destinationGauge = _destinationGaugeFull;
        orderState = State.DESTINATION_FULL_GAUGED;
        logger.destinationFullGaugeRegisteredEvent(address(this));

    }

    function signDestinationGauge(bytes32 _signedMeasurement, bool _isFullMeasurement) public {
        require(operator.did == msg.sender && 
            (orderState == State.DESTINATION_FULL_GAUGED || orderState == State.DESTINATION_EMPTY_GAUGED),
            'Only the operator can do this action.');
        destinationGauge = _signedMeasurement;
        if(_isFullMeasurement) {
            orderState = State.UNLOADED;
        } else {
            orderState = State.COMPLETED;
            payable(operator.did).transfer(address(this).balance);
        }       
    }
    
    function registerDestinationGaugeEmpty(bytes32 _destinationGaugeEmpty) public {
        require((gaugingSensor.did == msg.sender ) 
         && orderState == State.UNLOADED);
        destinationGauge = _destinationGaugeEmpty;
        orderState = State.DESTINATION_EMPTY_GAUGED;
        logger.destinationEmptyGaugeRegisteredEvent(address(this));
    }

     /**
     * @notice Cargo Inspection Destination
     */

    function requestDestinationInspectorRole(bytes32 _uuid) public {
        require(cargoInspectorDestination.did == address(0x0) && orderState == State.IN_TRANSIT);
        logger.inspectorDestinationRoleRequestEvent(address(this), msg.sender, _uuid);
    }
    
    function assignDestinationInspectorRole(bytes32 _uuid, address _did, bool _success) public isVerifier(msg.sender) {    
        if (_success) {
            cargoInspectorDestination = Participant(_uuid, _did);
        }
        logger.inspectorDestinationRoleAssignedEvent(address(this), _did, _success);
    }
    
    function registerDestinationInspectionReport(bytes32 _inspectionReport) public {
        require(cargoInspectorDestination.did == msg.sender && orderState == State.IN_TRANSIT);
        cargoDetailsDestination = _inspectionReport;
        orderState = State.INSPECTED_DESTINATION;
    }

    function signDestinationInspectionReport(bytes32 _signedReport) public {
        require(operator.did == msg.sender && orderState == State.INSPECTED_DESTINATION);
        cargoDetailsDestination = _signedReport;
        orderState = State.REPORT_DESTINATION_SIGNED;
    }
      
     /**
     * @notice Cancelling the contract
     */
    
    function cancelOrder() public {
        require(orderState != State.COMPLETED && msg.sender == operator.did);
        orderState = State.CANCELED;
        payable(client).transfer(address(this).balance);
    }
    
}