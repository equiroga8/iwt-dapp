const TransportationOrderLogger = require('../src/artifacts/contracts/TransportationOrderLogger.sol/TransportationOrderLogger.json');
const DIDMSystem = require('../src/artifacts/contracts/DIDMSystem.sol/DIDMSystem.json');
const TransportationOrder = require('../src/artifacts/contracts/TransportationOrder.sol/TransportationOrder.json');
const EthCrypto = require('eth-crypto');
const { ethers } = require("ethers");
const AWS = require('aws-sdk');
var express = require('express');
var app = express();
var cors = require('cors');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');

AWS.config.update({
    accessKeyId: "YOURKEY",
    secretAccessKey: "YOURSECRET",
});
const PORT = 3004;
const LOGGER_ADDR = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const DIDM_ADDR = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
const FAKE_PRIVATE_KEY = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e';

const challengeStrings = new Map();

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

const readData = async (tableName, hash) => {
    const documentClient = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000',
    });
    
    const params = {
        TableName: tableName,
        Key: {
            "key": hash
        }
    };
    try {
        return await documentClient.get(params).promise();
    } catch (e) {
        console.log(e);
    }
}

const setData = async (tableName, hash, data) => {
    const documentClient = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000',
    });
    
    const params = {
        TableName: tableName,
        Item: {
            key: hash,
            data: data
        }
    };
    try {
        const data = await documentClient.put(params).promise();
        console.log(data);
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

const makeid = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

app.use(cors());

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());

app.post('/challenge', async (req, res) => {
    console.log(`Recieved a challenge request from ${req.body.did} for order ${req.body.orderAddr} with public key ${req.body.publicKey}`);
    // Fetch participants and check dids
    const did = req.body.did;
    const transportationOrder = new ethers.Contract(req.body.orderAddr, TransportationOrder.abi, signer);
    const operator = await transportationOrder.operator();
    const cargoInspectorOrigin = await transportationOrder.cargoInspectorOrigin();
    const cargoInspectorDestination = await transportationOrder.cargoInspectorDestination();
    
    //const address = EthCrypto.publicKey.toAddress(req.body.publicKey.substring(2));
    
    if ((did === operator[1] || did === cargoInspectorDestination[1] || did === cargoInspectorOrigin[1])) {
        // Generate random string;
        const challenge = makeid(15);
        challengeStrings.set(did, challenge);
        // Encrypt it with did public key
        const encryptedMessage = ethUtil.bufferToHex(
            Buffer.from(
              JSON.stringify(
                sigUtil.encrypt(
                    req.body.publicKey,
                  { data: challenge },
                  'x25519-xsalsa20-poly1305'
                )
              ),
              'utf8'
            )
          );
        res.json({challenge: encryptedMessage});

    } else {
        res.json({message: "Failed"});
    }
    
});


app.post('/write', async (req, res) => {
    console.log(`Recieved a challenge response from ${req.body.did} to write data with uuid ${req.body.uuid}.`);

    const did = req.body.did;
    const orderAddress = req.body.orderAddr;
    const uuid = req.body.uuid;
    const data = req.body.data;
    const challengeEncrypted = req.body.challenge;

    // Decrypt challenge
    const encryptedObject = EthCrypto.cipher.parse(challengeEncrypted);
    const challenge = await EthCrypto.decryptWithPrivateKey(FAKE_PRIVATE_KEY, encryptedObject);

    // Check if challenge string is the same
    if (challengeStrings.get(did) === JSON.parse(challenge)) {
        await setData(orderAddress, uuid, data);
        res.status(200).send('Challenge completed');
        console.log(`Challenge completed. Data with uuid ${req.body.uuid} written to database`);
    } else {
        res.status(400).send('Bad Request');
    }
});

app.post('/read', async (req, res) => {
    console.log(`Recieved a challenge response from ${req.body.did} to read data with uuid ${req.body.uuid}.`);

    const did = req.body.did;
    const orderAddress = req.body.orderAddr;
    const uuid = req.body.uuid;
    const challengeEncrypted = req.body.challenge;
    
    // Decrypt challenge
    const encryptedObject = EthCrypto.cipher.parse(challengeEncrypted);
    const challenge = await EthCrypto.decryptWithPrivateKey(FAKE_PRIVATE_KEY, encryptedObject);
    
    // Check if challenge string is the same
    if (challengeStrings.get(did) === JSON.parse(challenge)) {   
        const response = await readData(orderAddress, uuid);
        res.json({response})
        console.log(`Challenge completed. Data with uuid ${req.body.uuid} sent.`);
    } else {
        console.log(`Challenge failed.`);
        res.status(400).send('Challenge failed');
    }
});

app.listen(PORT, function () {
    console.log('Listening on port ' + PORT + '!');
});