const { LOCAL_DDB_SETTINGS } = require('./helper');
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: "YOURKEY",
    secretAccessKey: "YOURSECRET",
});

export const createTable = async (tableName) => {

    const ddb = new AWS.DynamoDB(LOCAL_DDB_SETTINGS);
    
    const params = {
        AttributeDefinitions: [
           {
          AttributeName: "key", 
          AttributeType: "S"
         }
        ], 
        KeySchema: [
           {
          AttributeName: "key", 
          KeyType: "HASH"
        }
        ], 
        ProvisionedThroughput: {
         ReadCapacityUnits: 5, 
         WriteCapacityUnits: 5
        }, 
        TableName: tableName
       };

    try {
        await ddb.createTable(params).promise();
    } catch (e) {
        console.log(e);
    }
}

export const uploadCredentialsToDDB = async (tableName, hash, data) => {
    const documentClient = new AWS.DynamoDB.DocumentClient(LOCAL_DDB_SETTINGS);
    
    const params = {
        TableName: tableName,
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

export const getData = async (tableName, hash) => {
    const documentClient = new AWS.DynamoDB.DocumentClient(LOCAL_DDB_SETTINGS);
    
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

export const setData = async (tableName, hash, data) => {
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
        console.log(data);
    } catch (e) {
        console.log(e);
    }
}

