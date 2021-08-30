const TransportationOrderLogger = require('../src/artifacts/contracts/TransportationOrderLogger.sol/TransportationOrderLogger.json');
const TransportationOrder = require('../src/artifacts/contracts/TransportationOrder.sol/TransportationOrder.json');
const EthCrypto = require('eth-crypto');
const { ethers } = require("ethers");
const AWS = require('aws-sdk');
const fs = require('fs')

AWS.config.update({
    accessKeyId: "YOURKEY",
    secretAccessKey: "YOURSECRET",
});

const LOGGER_ADDR = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const CREDENTIAL_PATH = 'credentials/gauger/Gauge-Calibration.txt';
const LOCAL_DDB_SETTINGS = { region: 'localhost', endpoint: 'http://localhost:8000' };
const VERIFIER_PUB_Key = '7bf824b28c4bf11ce553fa746a18754949ab4959e2ea73465778d14179211f8c87f456ff40773aafed961a226e0bfa251547013a81c24951a733f65cfed8dc5e';
const GAUGING_DATA_TEMPL = {
    originEmpty: {
        reading: {
            measurement: null,
            timestamp: null
        },
        gaugerSignature: null,
        operatorSignature: null
    },
    originFull: {
        reading: {
            measurement: null,
            timestamp: null
        },
        gaugerSignature: null,
        operatorSignature: null
    },
    destinationFull: {
        reading: {
            measurement: null,
            timestamp: null
        },
        gaugerSignature: null,
        operatorSignature: null
    },
    destinationEmpty: {
        reading: {
            measurement: null,
            timestamp: null
        },
        gaugerSignature: null,
        operatorSignature: null
    }
};
const MEAS_EMPTY = 30;
const MEAS_FULL = 60;
const orderState = {
    INITIAL: 0, 
    ASSIGNED: 1, 
    INSPECTED_ORIGIN: 2,
    REPORT_ORIGIN_SIGNED: 3,
    ORIGIN_EMPTY_GAUGED: 4,
    LOADED: 5, 
    ORIGIN_FULL_GAUGED: 6, 
    IN_TRANSIT: 7, 
    INSPECTED_DESTINATION: 8,
    REPORT_DESTINATION_SIGNED: 9,
    DESTINATION_FULL_GAUGED: 10,
    UNLOADED: 11, 
    DESTINATION_EMPTY_GAUGED: 12, 
    COMPLETED: 13, 
    CANCELED: 14
  };



const provider = new ethers.providers.JsonRpcProvider();
const signer = provider.getSigner(1);
const loggerContract = new ethers.Contract(LOGGER_ADDR, TransportationOrderLogger.abi, signer);


const getGaugingData = async (tableName, hash) => {
    const documentClient = new AWS.DynamoDB.DocumentClient(LOCAL_DDB_SETTINGS);
    
    const params = {
        TableName: tableName,
        Key: {
            key: hash
        }
    };
    try {
        return await documentClient.get(params).promise();
    } catch (e) {
        console.log(e);
    }
}

const setData = async (tableName, hash, data) => {
    const documentClient = new AWS.DynamoDB.DocumentClient(LOCAL_DDB_SETTINGS);
    
    const params = {
        TableName: tableName,
        Item: {
            key: hash,
            data: data
        }
    };
    try {
        const data = await documentClient.put(params).promise();
        //console.log(data);
    } catch (e) {
        console.log(e);
    }
}

const uploadCredentialsToDDB = async (hash, data) => {
    const documentClient = new AWS.DynamoDB.DocumentClient(LOCAL_DDB_SETTINGS);
    
    const params = {
        TableName: 'Credentials',
        Item: {
            credentialHash: hash,
            data: data
        }
    };
    try {
        const data = await documentClient.put(params).promise();
        //console.log(data);
    } catch (e) {
        console.log(e);
    }
}

const requestGaugerRole = async (orderAddress, gaugerDID) => {
    // Upload credentials
    let vc = fs.readFileSync(CREDENTIAL_PATH, 'utf8');
    const encrypted = await EthCrypto.encryptWithPublicKey(
        VERIFIER_PUB_Key, 
        JSON.stringify(JSON.parse(vc))
    );
    const encryptedString = EthCrypto.cipher.stringify(encrypted);
    const uuid = ethers.utils.id(encryptedString);
    console.log(`Key: ${uuid}`);
    await uploadCredentialsToDDB(uuid, encryptedString);
    
    // Request role
    const orderContract = new ethers.Contract(orderAddress, TransportationOrder.abi, signer);
    const transaction = await orderContract.requestGaugerRole(uuid);
    await transaction.wait();
    await loggerContract.once('GaugerRoleAssigned', async (orderAddr, gaugerDID, success) => {
        console.log(`GaugerRoleAssigned ${success}: to ${gaugerDID} for order ${orderAddr}`);
        // First measurement
        let gaugingData = GAUGING_DATA_TEMPL;
        gaugingData.originEmpty.reading.measurement = MEAS_EMPTY;
        gaugingData.originEmpty.reading.timestamp = Date.now();
        const reading = gaugingData.originEmpty.reading;
        const newSignature = await signer.signMessage(JSON.stringify(reading));
        gaugingData.originEmpty.gaugerSignature = newSignature;

        // I would have to substitute this for off-chain verification
        const data = JSON.stringify(gaugingData);
        const hash = ethers.utils.id(data);
        await setData(orderAddress, hash, data);
        // END here

        const transportationOrder = new ethers.Contract(orderAddress, TransportationOrder.abi, signer);
        const transaction = await transportationOrder.registerOriginGaugeEmpty(hash);
        await transaction.wait();
    });

}

provider.once("block", () => {
    loggerContract.on("GaugeRequested", async (orderAddress, gaugerDID) => {
        console.log('\n',`Captured event 'GaugeRequested' for Order '${orderAddress}'`);
        const transportationOrder = new ethers.Contract(orderAddress, TransportationOrder.abi, signer);
        const state = await transportationOrder.orderState();
        
        if (state === orderState.ASSIGNED || state === orderState.REPORT_ORIGIN_SIGNED) {
            console.log("First request for this order, requesting gauger role.");
            await requestGaugerRole(orderAddress, gaugerDID);

        } else if (state === orderState.LOADED) {
            console.log("Second gauge request for this order");
            const hash = await transportationOrder.originGauge();

            let response = await getGaugingData(orderAddress, hash);

            let gaugingData = JSON.parse(response.Item.data);
            gaugingData.originFull.reading.measurement = MEAS_FULL;
            gaugingData.originFull.reading.timestamp = Date.now();
            const reading = gaugingData.originFull.reading;
            const newSignature = await signer.signMessage(JSON.stringify(reading));
            gaugingData.originFull.gaugerSignature = newSignature;

            // I would have to substitute this for off-chain verification
            const data = JSON.stringify(gaugingData);
            const newHash = ethers.utils.id(data);
            await setData(orderAddress, newHash, data);
            // END here
            const transaction = await transportationOrder.registerOriginGaugeFull(newHash);
            await transaction.wait();
        } else if (state === orderState.IN_TRANSIT || state === orderState.REPORT_DESTINATION_SIGNED) {
            console.log("Third gauge request for this order");
            const hash = await transportationOrder.originGauge();

            let response = await getGaugingData(orderAddress, hash);

            let gaugingData = JSON.parse(response.Item.data);
            gaugingData.destinationFull.reading.measurement = MEAS_FULL;
            gaugingData.destinationFull.reading.timestamp = Date.now();
            const reading = gaugingData.destinationFull.reading;
            const newSignature = await signer.signMessage(JSON.stringify(reading));
            gaugingData.destinationFull.gaugerSignature = newSignature;

            // I would have to substitute this for off-chain verification
            const data = JSON.stringify(gaugingData);
            const newHash = ethers.utils.id(data);
            await setData(orderAddress, newHash, data);
            // END here
            const transaction = await transportationOrder.registerDestinationGaugeFull(newHash);
            await transaction.wait();
        } else {
            console.log("Fourth gauge request for this order");
            const hash = await transportationOrder.destinationGauge();

            let response = await getGaugingData(orderAddress, hash);

            let gaugingData = JSON.parse(response.Item.data);
            gaugingData.destinationEmpty.reading.measurement = MEAS_EMPTY;
            gaugingData.destinationEmpty.reading.timestamp = Date.now();
            const reading = gaugingData.destinationEmpty.reading;
            const newSignature = await signer.signMessage(JSON.stringify(reading));
            gaugingData.destinationEmpty.gaugerSignature = newSignature;

            // I would have to substitute this for off-chain verification
            const data = JSON.stringify(gaugingData);
            const newHash = ethers.utils.id(data);
            await setData(orderAddress, newHash, data);
            // END here
            const transaction = await transportationOrder.registerDestinationGaugeEmpty(newHash);
            await transaction.wait();
        }

        //console.log(`Order '${orderAddress}' with client DID ${clientDID} ${result ? 'has been created': 'has been canceled'}`);
        console.log('-------------------------------------------------');
    });

    
});
