// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require('fs')
const AWS = require('aws-sdk');
const ethers = hre.ethers;

AWS.config.update({
    accessKeyId: "YOURKEY",
    secretAccessKey: "YOURSECRET",
});

const LOCAL_DDB_SETTINGS = {
  region: 'localhost',
  endpoint: 'http://localhost:8000',
}

// 5 templates
const credentialTemplates = [{
  credentialType: "BargeLicence",
  schema: '{' +
  '"name":"String",' +
  '"surname":"String",' +
  '"country":"String",' +
  '"type":"String"}',
  signerNumber: 18
},{
  credentialType: "HazardousTransport",
  schema: '{' +
  '"name":"String",' +
  '"surname":"String",' +
  '"country":"String",' +
  '"grade":"String"}',
  signerNumber: 16
},{
  credentialType: "BargeRegistration",
  schema: '{' +
  '"bargeDID":"String",' +
  '"manufacturer":"String",' +
  '"model":"String",' +
  '"length":"String",' +
  '"width":"String",' +
  '"maxCapacity":"String"}',
  signerNumber: 15
},{
  credentialType: "CargoInspectorLicence",
  schema: '{' +
  '"name":"String",' +
  '"surname":"String",' +
  '"examination":"String"}',
  signerNumber: 17
},{
  credentialType: "GaugeCalibration",
  schema: '{' +
  '"manufacturer":"String",' +
  '"model":"String",' +
  '"calibrationTestPassed":"Boolean"}',
  signerNumber: 14
}];

const digitalCredentials = [
  {
    path: './credentials/operator/SW-Barge-Licence.txt',
    issuerNumber: 18,
    recoveryAddress: '0xaFA713C081039158B79e99a693f387A6e28E9eF6'
  },
  {
    path: './credentials/operator/SW-Hazardous-Transport.txt',
    issuerNumber: 16,
    recoveryAddress: '0xaaB5f65E40E37B7086D5e96BDD7b843b25280748'
  },
  {
    path: './credentials/operator/Barge-Registration.txt',
    issuerNumber: 15,
    recoveryAddress: '0xaC08351626350A22eD90d28A85a46018763f60F9'
  },
  {
    path: 'credentials/inspector/D-Cargo-Inspector-Licence.txt',
    issuerNumber: 17,
    recoveryAddress: '0xa76958A587001b645c49e19BAa0D79DDE32cC991'
  },
  {
    path: 'credentials/inspector/O-Cargo-Inspector-Licence.txt',
    issuerNumber: 17,
    recoveryAddress: '0xa74B61C60546273C0a3Fca5dc36263b860AE3C36'
  },
  {
    path: './credentials/gauger/Gauge-Calibration.txt',
    issuerNumber: 14,
    recoveryAddress: '0xaa60C2b63aAE7D97C08d4C5a92bd039DC11dA564'
  }
];

const createDIDs = async (signers, provider, didmSystem) => {
  for (let num of signers) {
    let signer = provider.getSigner(num);
    let didmSystemAsSigner = didmSystem.connect(signer);
    await didmSystemAsSigner.createDID();
  }
  console.log("DIDs added to DIDM system.");
};

const addCredentialSchemas = async (provider, didmSystem) => {
  for (let template of credentialTemplates) {
    let signer = provider.getSigner(template.signerNumber);
    let didmSystemAsSigner = didmSystem.connect(signer);
    let hash = ethers.utils.id(template.schema);
    let type = ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.toUtf8Bytes(template.credentialType), 32));
    await didmSystemAsSigner.createTemplate(hash, type);
  }
  console.log("Credential schemas added to DIDM system.");
};

const sumbitCredentialRecords = async (provider, didmSystem) => {
  for (let cred of digitalCredentials){
    let vc = fs.readFileSync(cred.path, 'utf8');
    //console.log(typeof credential);
    let vcHash = ethers.utils.id(JSON.stringify(JSON.parse(vc)));
    let signer = provider.getSigner(cred.issuerNumber);
    let didmSystemAsSigner = didmSystem.connect(signer);
    await didmSystemAsSigner.createDCRecord(vcHash, cred.recoveryAddress);
    
  }
  console.log("Credential records added to DIDM system.")
}

const createCredentialsTable = async () => {

  const ddb = new AWS.DynamoDB(LOCAL_DDB_SETTINGS);
  
  const params = {
      AttributeDefinitions: [
          {
        AttributeName: "credentialHash", 
        AttributeType: "S"
        }
      ], 
      KeySchema: [
          {
        AttributeName: "credentialHash", 
        KeyType: "HASH"
      }
      ], 
      ProvisionedThroughput: {
        ReadCapacityUnits: 5, 
        WriteCapacityUnits: 5
      }, 
      TableName: "Credentials"
      };

  try {
      await ddb.createTable(params).promise();
  } catch (e) {
      console.log(e);
  }

}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Create credentials table 
  await createCredentialsTable();

  // We get the contract to deploy
  const TransportationOrderFactory = await hre.ethers.getContractFactory("TransportationOrderFactory");
  const transportationOrderFactory = await TransportationOrderFactory.deploy();

  await transportationOrderFactory.deployed();

  console.log("Factory deployed to:", transportationOrderFactory.address);

  const TransportationOrderLogger = await hre.ethers.getContractFactory("TransportationOrderLogger");
  const transportationOrderLogger = await TransportationOrderLogger.deploy();

  await transportationOrderLogger.deployed();

  console.log("Logger deployed to:", transportationOrderLogger.address);

  const DIDMSystem = await hre.ethers.getContractFactory("DIDMSystem");
  const didmSystem = await DIDMSystem.deploy();

  await didmSystem.deployed();

  console.log("DIDM System deployed to:", didmSystem.address);

  const provider = new ethers.providers.JsonRpcProvider();

  await createDIDs([0, 1, 2, 3, 4, 5, 14, 15, 16, 17, 18, 19], provider, didmSystem);
  await addCredentialSchemas(provider, didmSystem);
  await sumbitCredentialRecords(provider, didmSystem);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
