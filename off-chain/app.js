const TransportationOrderLogger = require('../src/artifacts/contracts/TransportationOrderLogger.sol/TransportationOrderLogger.json');
const DIDMSystem = require('../src/artifacts/contracts/DIDMSystem.sol/DIDMSystem.json');
const TransportationOrder = require('../src/artifacts/contracts/TransportationOrder.sol/TransportationOrder.json');
const EthCrypto = require('eth-crypto');
const { ethers } = require("ethers");
const AWS = require('aws-sdk');
const http = require('http');


AWS.config.update({
    accessKeyId: "YOURKEY",
    secretAccessKey: "YOURSECRET",
});

const LOGGER_ADDR = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const DIDM_ADDR = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
const FAKE_PRIVATE_KEY = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e';

const provider = new ethers.providers.JsonRpcProvider();
// Verifier account
const signer = provider.getSigner(19);
// Get deployed contract instances
const loggerContract = new ethers.Contract(LOGGER_ADDR, TransportationOrderLogger.abi, signer);
const didmContract = new ethers.Contract(DIDM_ADDR, DIDMSystem.abi, signer);

// Get credential from dynamo db credentials table
const getData = async (tableName, hash) => {
    const documentClient = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000',
    });
    
    const params = {
        TableName: tableName,
        Key: {
            credentialHash: hash
        }
    };
    try {
        return await documentClient.get(params).promise();
    } catch (e) {
        console.log(e);
    }
}

// Listen to future events only
provider.once("block", () => {
    loggerContract.on("OrderCreationRequest", async (orderAddress, clientDID) => { 

        console.log('\n',`Captured event 'OrderCreationRequest' for Order '${orderAddress}'`);

        const result = await didmContract.verifyDID(clientDID);
        const transportationOrder = new ethers.Contract(orderAddress, TransportationOrder.abi, signer);
        const transaction = await transportationOrder.verificationResult(result);
        await transaction.wait();

        console.log(`Order '${orderAddress}' with client DID ${clientDID} ${result ? 'has been created': 'has been canceled'}`);
        console.log('-------------------------------------------------');
    });

    loggerContract.on("OrderAssignmentRequest", async (orderAddress, operatorDID, uuid) => {
        
        console.log("\n","OrderAssignmentRequest Captured: " + uuid);

        const response = await getData('Credentials', uuid);

        const decryptedCredentials = await decryptCredentials(response);

        let requiredCredentials = ["BargeRegistration", "BargeLicence", "HazardousTransport"];
        
        let result = await checkCredentials(requiredCredentials, decryptedCredentials, operatorDID);
        
        const transportationOrder = new ethers.Contract(orderAddress, TransportationOrder.abi, signer);
        const transaction = await transportationOrder.assignOperatorRole(uuid, operatorDID, result);
        await transaction.wait();

        console.log(`Order '${orderAddress}' has been assigned an Operator with DID ${operatorDID}: ${result}`, '\n');
        console.log('-------------------------------------------------');

    });

    loggerContract.on("InspectorOriginRoleRequest", async (orderAddress, inspectorDID, uuid) => { 
        console.log("\n","InspectorOriginRoleRequest Captured: " + uuid);

        const response = await getData('Credentials', uuid);

        const decryptedCredentials = await decryptCredentials(response);

        let requiredCredentials = ["CargoInspectorLicence"];
        
        let result = await checkCredentials(requiredCredentials, decryptedCredentials, inspectorDID);
        
        const transportationOrder = new ethers.Contract(orderAddress, TransportationOrder.abi, signer);
        const transaction = await transportationOrder.assignOriginInspectorRole(uuid, inspectorDID, result);
        await transaction.wait();

        console.log(`Order '${orderAddress}' has been assigned an Origin Inspector with DID ${inspectorDID}: ${result}`, '\n');
        console.log('-------------------------------------------------');
    });

    loggerContract.on("GaugerRoleRequest", async (orderAddress, gaugerDID, uuid) => { 
        console.log("\n","GaugerRoleRequest Captured: " + uuid);

        const response = await getData('Credentials', uuid);

        const decryptedCredentials = await decryptCredentials(response);

        console.log(decryptedCredentials);

        let requiredCredentials = ["GaugeCalibration"];
        
        let result = await checkCredentials(requiredCredentials, decryptedCredentials, gaugerDID);
        
        const transportationOrder = new ethers.Contract(orderAddress, TransportationOrder.abi, signer);
        const transaction = await transportationOrder.assignGaugerRole(uuid, gaugerDID, result);
        await transaction.wait();

        console.log(`Order '${orderAddress}' has been assigned a gauger with DID ${gaugerDID}: ${result}`, '\n');
        console.log('-------------------------------------------------');
    });

    loggerContract.on("InspectorDestinationRoleRequest", async (orderAddress, inspectorDID, uuid) => { 
        console.log("\n","InspectorDestinationRoleRequest Captured: " + uuid);

        const response = await getData('Credentials', uuid);

        const decryptedCredentials = await decryptCredentials(response);

        let requiredCredentials = ["CargoInspectorLicence"];
        
        let result = await checkCredentials(requiredCredentials, decryptedCredentials, inspectorDID);
        
        const transportationOrder = new ethers.Contract(orderAddress, TransportationOrder.abi, signer);
        const transaction = await transportationOrder.assignDestinationInspectorRole(uuid, inspectorDID, result);
        await transaction.wait();

        console.log(`Order '${orderAddress}' has been assigned a Destination Inspector with DID ${inspectorDID}: ${result}`, '\n');
        console.log('-------------------------------------------------');
    });

});

const checkCredentialOwnership = (vc, did) => {

    const validOwner = vc.credential.subject === did

    console.log('\n',`Subject DID: ${vc.credential.subject}`);
    console.log(`Actual address: ${did}`);
    console.log(`Are they the same address? -> ${validOwner}`);

    return validOwner;
}
const checkCredentialSignature = (vc) => {

    const signatureAddress = ethers.utils.verifyMessage(JSON.stringify(vc.credential), vc.proof.signature);
       
    
    const signatureValid = signatureAddress === vc.credential.issuer;
    console.log('\n',`Signature address: ${signatureAddress}`);
    console.log(`Actual address: ${vc.credential.issuer}`);
    console.log(`Are they the same address? -> ${signatureValid}`);
    return signatureValid;
}


const checkDIDsValidity = async (vc) => {

    const issuerDIDValid = await didmContract.verifyDID(vc.credential.issuer);
    const subjectDIDValid = await didmContract.verifyDID(vc.credential.subject);

    console.log('\n',`Issuer DID ${vc.credential.issuer} is valid? -> ${issuerDIDValid}`);
    console.log(`Subject DID ${vc.credential.subject} is valid? -> ${subjectDIDValid}`);

    return issuerDIDValid && subjectDIDValid;
};

const checkCredentialValidity = async (vc) => {

    const hashedCredential = ethers.utils.id(JSON.stringify(vc));
    const credentialValid = await didmContract.verifyDCRecord(hashedCredential);
    
    console.log('\n',`Credential hash ${hashedCredential} is valid? -> ${credentialValid}`);

    return credentialValid;
}; 

const decryptCredentials = async (encryptedData) => {

    const encryptedObject = EthCrypto.cipher.parse(encryptedData.Item.data);
    const decrypted = await EthCrypto.decryptWithPrivateKey(
        FAKE_PRIVATE_KEY,
        encryptedObject
    );
    let credentials = JSON.parse(decrypted);
    return Array.isArray(credentials) ? credentials : [credentials];
};

const checkCredentials = async (requiredCredentials, decryptedCredentials, did) => {
    
    let result = true;
    
    for (let vc of decryptedCredentials) {
       
        console.log('\n',`Credential type ${vc.credential.type}`);

        requiredCredentials = requiredCredentials.filter(type => {
            return type !== vc.credential.type;
        });
        
        const validSignature = checkCredentialSignature(vc);
        const isOwner = checkCredentialOwnership(vc, did);
        const validDIDs = await checkDIDsValidity(vc);
        const validCredential = await checkCredentialValidity(vc)

        result &= validSignature && isOwner && validDIDs && validCredential;
    }
    return result && requiredCredentials.length === 0;;
};


const hostname = '127.0.0.1';
const port = 3002;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});