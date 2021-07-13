// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Decentralized IDentity Management (DIDM) system
 * @author equiroga8 
 * This contract sirves as a purpose to store Digital Credentials (DC) 
 * and Decentralized IDentifiers (DID) for an Inland Waterway Transport 
 * (IWT) support dApp. It is used to authenticate any entity.
 **/
 
contract DIDMSystem {
    
    struct DIDDocument {
        bool valid;
        bool isDID;
    }
    
    struct DCTemplate {
        bytes32 hashedCredentialTemplate;
        bool isDCTemplate;
        address issuerDID;
    }
    
    struct DCRecord {
        bool valid;
        bool isDCRecord;
        address issuerDID;
        address alternativeAddress;
    }

    mapping(address => DIDDocument) private didRegistry;
    
    mapping(bytes32 => DCRecord) private dcRegistry;
    
    mapping(bytes32 => DCTemplate) private dcTemplatesRegistry;
    

    modifier isNewDID(address _didAddress) {
         require(!didRegistry[_didAddress].isDID, "A DID with this address has already been registered.");
         _;
    }
    
    modifier isDIDValid(address _didAddress) {
        require(didRegistry[_didAddress].isDID, "This DID does not exist.");
        require(didRegistry[_didAddress].valid, "This DID has been deactivated.");
        _;
    }
    
    modifier isNewDCtemplate(bytes32 _templateType) {
        require(!dcTemplatesRegistry[_templateType].isDCTemplate, "This digital credential template name already exists. Please choose a different name");         _;
    }
    
    modifier isNewDC(bytes32 _hashedDC) {
        require(!dcRegistry[_hashedDC].isDCRecord, "This digital credential has already been registered.");         _;
    }
    
    modifier isDCValid(bytes32 _hashedDC) {
        require(dcRegistry[_hashedDC].isDCRecord, "This DC does not exist.");
        require(dcRegistry[_hashedDC].valid, "This DC has been deactivated.");
        _;
    }
    
    
    /**
     * @notice Creates a new DID using the sender's address 
     * only if it doesn't exist yet.
     */
    

    function createDID() public isNewDID(msg.sender) {
        didRegistry[msg.sender].valid = true;
        didRegistry[msg.sender].isDID = true;
    }
    
    /**
     * @notice Invalidates a DID. This action can only be done by the DID owner.
     */
    
    function invalidateDID() public isDIDValid(msg.sender) {
        didRegistry[msg.sender].valid = false;
    }
    
    /**
     * @notice Creates a digital credential template. It checks if the DID of the actor that's creating the template exists and is valid and that the template does not yet exist.
     * @param _hashedCredentialTemplate: hash of the template that is used as a URL to retrieve the actual template object from a cloud storage service.
     * @param _templateType: Name of the credential type. It has to be unique.
     */
    
    function createTemplate(bytes32 _hashedCredentialTemplate, bytes32 _templateType) public 
        isDIDValid(msg.sender) isNewDCtemplate(_templateType) isNewDCtemplate(_templateType) {
            
        dcTemplatesRegistry[_templateType].hashedCredentialTemplate = _hashedCredentialTemplate;
        dcTemplatesRegistry[_templateType].isDCTemplate = true;
        dcTemplatesRegistry[_templateType].issuerDID = msg.sender;
    }
    
    /**
     * @notice Creates a digital credential record. It checks if the DID of the actor that's issuing the DC exists and is valid and that the DC record does not yet exist.
     * @param _hashedDC: hash of the digital credential.
     * @param _recoveryAddress: ethereum address used by the Owner of the DC. It should not be the same as the owner's DID.
     */
    
    function createDCRecord(bytes32 _hashedDC, address _recoveryAddress) public isDIDValid(msg.sender) isNewDC(_hashedDC) {
        dcRegistry[_hashedDC].valid = true;
        dcRegistry[_hashedDC].isDCRecord = true;
        dcRegistry[_hashedDC].issuerDID = msg.sender;
        dcRegistry[_hashedDC].alternativeAddress = _recoveryAddress;
    }
    
    /**
     * @notice Invalidates a digital credential record. It checks if the DC record exists and is valid. This action can only be performed by the Issuer or Owner of the credential. The owner has to use his alternative address to do so.
     * @param _hashedDC: hash of the digital credential.
     */
    
    function invalidateDigitalCredential(bytes32 _hashedDC) isDCValid(_hashedDC) public {
        DCRecord memory dcToBeInvalidated = dcRegistry[_hashedDC];
        require(dcToBeInvalidated.issuerDID == msg.sender || dcToBeInvalidated.alternativeAddress == msg.sender, 
            "This address is not authorised to invalidate this record");
        dcToBeInvalidated.valid = false;
        dcRegistry[_hashedDC] = dcToBeInvalidated;
    }
    
    function verifyDID(address _didAddress) public view returns (bool) {
        return didRegistry[_didAddress].isDID && didRegistry[_didAddress].valid;
    }
    
    function verifyDCRecord(bytes32 _hashedDC) public view returns (bool) {
        return dcRegistry[_hashedDC].isDCRecord && dcRegistry[_hashedDC].valid;
    }

}