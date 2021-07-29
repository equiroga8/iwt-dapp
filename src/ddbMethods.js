import { LOCAL_DDB_SETTINGS } from './helper';
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
          AttributeName: "Credentials", 
          AttributeType: "S"
         }
        ], 
        KeySchema: [
           {
          AttributeName: "Credentials", 
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

export const writeToTable = async (tableName, hash, data) => {
    const documentClient = new AWS.DynamoDB.DocumentClient(LOCAL_DDB_SETTINGS);
    
    const params = {
        TableName: tableName,
        Item: {
            id: hash,
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

export const getData = async (tableName, hash) => {
    const documentClient = new AWS.DynamoDB.DocumentClient(LOCAL_DDB_SETTINGS);
    
    const params = {
        TableName: tableName,
        Key: {
            id: hash
        }
    };
    try {
        return await documentClient.get(params).promise();
    } catch (e) {
        console.log(e);
    }
}

