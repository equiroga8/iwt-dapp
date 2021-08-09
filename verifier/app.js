const TransportationOrderLogger = require('../src/artifacts/contracts/TransportationOrderLogger.sol/TransportationOrderLogger.json');
const DIDMSystem = require('../src/artifacts/contracts/DIDMSystem.sol/DIDMSystem.json');
const TransportationOrder = require('../src/artifacts/contracts/TransportationOrder.sol/TransportationOrder.json');
const EthCrypto = require('eth-crypto');
const { ethers } = require("ethers");
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: "YOURKEY",
    secretAccessKey: "YOURSECRET",
});

const LOGGER_ADDR = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const DIDM_ADDR = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
const FAKE_PRIVATE_KEY = '0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e';

const provider = new ethers.providers.JsonRpcProvider();
const signer = provider.getSigner(19);
const loggerContract = new ethers.Contract(LOGGER_ADDR, TransportationOrderLogger.abi, signer);
const didmContract = new ethers.Contract(DIDM_ADDR, DIDMSystem.abi, signer);

const getData = async (tableName, hash) => {
    const documentClient = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000',
    });
    
    const params = {
        TableName: tableName,
        Key: {
            credentialsHash: hash
        }
    };
    try {
        return await documentClient.get(params).promise();
    } catch (e) {
        console.log(e);
    }
}

provider.once("block", () => {
    loggerContract.on("OrderCreationRequest", async (orderAddress, clientDID) => { 
        console.log(`Captured event 'OrderCreationRequest' for Order '${orderAddress}'`);
        const result = await didmContract.verifyDID(clientDID);
        const transportationOrder = new ethers.Contract(orderAddress, TransportationOrder.abi, signer);
        await transportationOrder.verificationResult(result);
        console.log(`Order '${orderAddress}' with client DID ${clientDID} ${result ? 'has been created': 'has been canceled'}`);
    });

    loggerContract.on("OrderAssignmentRequest", async (orderAddress, operatorDID, uuid) => {
        
        // retrieve encrypted data from dynamoDB
        const data = getData('Credentials', uuid);
        console.log(data);
        // decrypt data
        const encryptedObject = EthCrypto.cipher.parse(data);
        const decrypted = await EthCrypto.decryptWithPrivateKey(
            FAKE_PRIVATE_KEY,
            encryptedObject
        );

        const [...decryptedPayload] = JSON.parse(decrypted);

        console.log(`Decrypted payload: ${decryptedPayload}`);

        let result = true;
        let neededCredentials = ["", "", ""];
        for (let credential of decryptedPayload) {
            // check signature and DIDs
            console.log("For credential:");
            console.log("Credential");
            const signatureAddress = EthCrypto.recover(
                credential.proof.signature,
                EthCrypto.hash.keccak256(credential.credential)
            );
            const signatureValid = signatureAddress === credential.issuer;
            console.log(`Signature address: ${signatureAddress}`);
            console.log(`Actual address: ${credential.issuer}`);
            console.log(`Are they the same address? -> ${signatureValid}`);
            
            const issuerDIDValid = await didmContract.verifyDID(credential.issuer);
            const subjectDIDValid = await didmContract.verifyDID(credential.subject);
            
            console.log(`Issuer DID ${credential.issuer} is valid? -> ${issuerDIDValid}`);
            console.log(`Subject DID ${credential.subject} is valid? -> ${subjectDIDValid}`);

            const hashedCredential = ethers.utils.id(credential);
            const credentialValid = await didmContract.verifyDCRecord(hashedCredential);
            console.log(`Credential hash ${hashedCredential} is valid? -> ${credentialValid}`);
            console.log('-------------------------------------------------');

            result &= signatureValid && issuerDIDValid && subjectDIDValid && credentialValid;
        }

        console.log(`All check passed: ${result}`)

    });

    loggerContract.on("InspectorRoleRequest", (orderAddress, inspectorDID, uuid) => { 

    });

    loggerContract.on("GaugerRoleRequest", (orderAddress, inspectorDID, uuid) => { 

    });

});

/*
loggerContract.on("OrderCreationRequest", (orderAddress) => {
    console.log(`Captured event 'OrderCreationRequest' for Order '${orderAddress}'`);
});
*/

const getCredentials = (orderAddress, uuid) => {

};

const checkDIDValidity = (did) => {

};

const checkCredentialValidity = (credentialHash) => {

}; 