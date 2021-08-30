import { encrypt } from 'eth-sig-util';
import { ethers } from 'ethers';
const jsonata = require("jsonata");
const axios = require('axios');
const EthCrypto = require('eth-crypto');

export const WEI_VAL = 1000000000000000000;
export const DEC_PLACES_REGEX = /^\d+(\.\d{0,2})?$/;
//export const VERIFIER_ADDR = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
export const VERIFIER_PUB_Key = '7bf824b28c4bf11ce553fa746a18754949ab4959e2ea73465778d14179211f8c87f456ff40773aafed961a226e0bfa251547013a81c24951a733f65cfed8dc5e';
export const LOGGER_ADDR = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
export const FACT_ADDR = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const DESTINATION_INSPECTOR = "Destination port inspector";
export const OPERATOR = "Operator";
export const ORIGIN_INSPECTOR = "Origin port inspector";
export const CLIENT = "Client";
export const GAUGER = "Gauger";

export const GAUGING_DETAILS_TEMPL = {
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

export const INSP_DETAILS_TEMPL = {
  details: {
    holds: [],
    bargeDID: null
  },
  inspectorSignature: null,
  operatorSignature: null,
};

export const ADDR_ZERO = ethers.constants.AddressZero;
export const HASH_ZERO = ethers.constants.HashZero;

export const LOCAL_DDB_SETTINGS = {
  region: 'localhost',
  endpoint: 'http://localhost:8000',
}

export const codeToPort = new Map([
    ["DEBON", "Bonn"], 
    ["DEDTM", "Dortmund"],
    ["DEDRS", "Dresden"],
    ["DEESS", "Essen"],
    ["DEFRA", "Frankfurt"], 
    ["DEHAM", "Hamburg"],
    ["DECGN", "Köln"],
    ["DEMAI", "Mainz"],
    ["DEMHG", "Mannheim"]
]);

export const cargoTypes = new Map([
  [0, "Bulk"], 
  [1, "Piece"],
  [2, "Hazardous"],
]);

export const orderState = {
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

export const orderStateMap = new Map([
  [0, 'Order created'], 
  [1, 'Order assigned'], 
  [2, 'Barge inspected in origin'],
  [3, 'Origin report signed'],
  [4, 'Origin empty gauging done'], 
  [5, 'Cargo loaded'], 
  [6, 'Origin full gauging done'],
  [7, 'Barge in transit'],
  [8, 'Barge inspected in destination'],
  [9, 'Destination report signed'],
  [10, 'Destination full gauging done'],
  [11, 'Barge unloaded'],
  [12, 'Destination empty gauging done'],
  [13, 'Order completed'],
  [14, 'Order canceled']
]);

export const dialogType = {
  VIEW_GAUGE_ORIGIN: 0, 
  SIGN_GAUGE_ORIGIN: 1, 
  GENERATE_REPORT_ORIGIN: 2,
  SIGN_REPORT_ORIGIN: 3,
  VIEW_REPORT_ORIGIN: 4,
  VIEW_GAUGE_DESTINATION: 5, 
  SIGN_GAUGE_DESTINATION: 6,
  GENERATE_REPORT_DESTINATION: 7,
  SIGN_REPORT_DESTINATION: 8,
  VIEW_REPORT_DESTINATION: 9,
};

export const dialogTypeTitle = new Map([
  [0, 'View origin gauging details'], 
  [1, 'Sign origin gauging details'], 
  [2, 'Generate origin inspection report'],
  [3, 'Sign origin inspection report'],
  [4, 'View origin inspection report'], 
  [5, 'View destination gauging details'], 
  [6, 'Sign destination gauging details'],
  [7, 'Generate destination inspection report'],
  [8, 'Sign destination inspection report'],
  [9, 'View destination inspection report'],
]);
export const hexToInt  = (value) => {
    return parseInt(Number(value), 10);
}

export const hexToString = (value) => {
    let hex  = value.toString().substring(2);
	let str = '';
	for (let n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
}

export const hexToDate = (value) => {
    let timestamp = hexToInt(value);
    let date = new Date(timestamp);

    return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear()
}

export const intToDate = (timestamp) => {

  let date = new Date(timestamp);

  return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear()
}

export const hexToPortName = (value) => {
    return codeToPort.get(hexToString(value));
}


// Functions to read multiple files

const readFileContents = async file => {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = reject;
      fileReader.readAsText(file);
    });
  };
export const readAllFiles = async AllFiles => {
    const results = await Promise.all(
      AllFiles.map(async file => {
        const fileContents = await readFileContents(file);
        return fileContents;
      })
    );
    return results;
  };

export const hashObjects = (objects) => {
    let stringObjects = "";
    for (let object of objects) {
        stringObjects += JSON.stringify(object);
    }
    return ethers.utils.id(stringObjects);
}


// Filtering

const getRoleRefinement = (role) => {
  let refinement = 'orderState=0 and operator[1]="0x0000000000000000000000000000000000000000"';
  if (role === ORIGIN_INSPECTOR) {
    refinement = 'orderState=1 and cargoInspectorOrigin[1]="0x0000000000000000000000000000000000000000"'
  } else if (role === DESTINATION_INSPECTOR) {
    refinement = 'orderState=7 and cargoInspectorDestination[1]="0x0000000000000000000000000000000000000000"'
  }
  return refinement;
}

export const refineOrders = (orders, filters) => {
  let expression = '[orders[';
  let refinements = [];
  if (filters.originPort && filters.originPort !== '') refinements.push(`originPort="${codeToPort.get(filters.originPort)}"`);
  if (filters.destinationPort && filters.destinationPort !=='') refinements.push(`destinationPort="${codeToPort.get(filters.destinationPort)}"`);
  if (filters.startDate) refinements.push(`deadline>=${filters.startDate}`);
  if (filters.endDate) refinements.push(`deadline<=${filters.endDate}`);
  if (filters.payoutRange) {
    refinements.push(`orderPayout>=${filters.payoutRange[0]}`);
    refinements.push(`orderPayout<=${filters.payoutRange[1]}`);
  }
  refinements.push(getRoleRefinement(filters.role));
  for(let i = 0; i < refinements.length; i++) {
    if (i === 0) expression += refinements[i];
    else expression += ' and ' + refinements[i];
  }
  expression += ']]';
  //console.log(expression);
  const query = jsonata(expression);
  let filteredOrders = query.evaluate({orders: orders});
  return  filteredOrders ? filteredOrders : [];

};

export const maxPayout = (orders) => {
  const query = jsonata("$max(orders.orderPayout)");
  const maxPayout = query.evaluate({orders: orders});
  return maxPayout ? maxPayout : 10;
};

export const minPayout = (orders) => {
  const query = jsonata("$min(orders.orderPayout)");
  const minPayout = query.evaluate({orders: orders});
  return minPayout ? minPayout : 0;
};

export const filterByAddress = (orders, address) => {
 
  let expression = `[orders[client="${address}" or operator[1]="${address}" or cargoInspectorDestination[1]="${address}" or cargoInspectorOrigin[1]="${address}"]]`;
  const query = jsonata(expression);
  let filteredOrders = query.evaluate({orders: orders});
  return  filteredOrders ? filteredOrders : [];
};




// Button text for orders 

export const getInspectionOriginButtonText = (actualRole, state) => {
  let buttonDetails;
  if (actualRole === ORIGIN_INSPECTOR) {
    if (state === orderState.INITIAL) {
      buttonDetails = {
        text: 'Submit FRI/CLI report',
        disabled: true,
        dialogType: dialogType.GENERATE_REPORT_ORIGIN
      };
    } else if (state === orderState.ASSIGNED) {
      buttonDetails = {
        text: 'Submit FRI/CLI report',
        disabled: false,
        dialogType: dialogType.GENERATE_REPORT_ORIGIN
      };
    } else {
      buttonDetails = {
        text: 'View FRI/CLI report',
        disabled: false,
        dialogType: dialogType.VIEW_REPORT_ORIGIN
      };
    }
    
  } else if (actualRole === OPERATOR) {
    if (state < orderState.INSPECTED_ORIGIN) {
      buttonDetails = {
        text: 'No FRI/CLI report available',
        disabled: true,
        dialogType: dialogType.SIGN_REPORT_ORIGIN
      };
    } else if (state === orderState.INSPECTED_ORIGIN) {
      buttonDetails = {
        text: 'Sign FRI/CLI report',
        disabled: false,
        dialogType: dialogType.SIGN_REPORT_ORIGIN
      };
    } else {
      buttonDetails = {
        text: 'View FRI/CLI report',
        disabled: false,
        dialogType: dialogType.VIEW_REPORT_ORIGIN
      };
    }
  } else {
    if (state < orderState.INSPECTED_ORIGIN) {
      buttonDetails = {
        text: 'No FRI/CLI report available',
        disabled: true,
        dialogType: dialogType.VIEW_REPORT_ORIGIN
      };
    } else {
      buttonDetails = {
        text: 'View FRI/CLI report',
        disabled: false,
        dialogType: dialogType.VIEW_REPORT_ORIGIN
      };
    }
  }
  return buttonDetails;
}

// HERE
export const getInspectionDestinationButtonText = (actualRole, state) => {
  let buttonDetails;
  if (actualRole === DESTINATION_INSPECTOR) {
    if (state < orderState.IN_TRANSIT) {
      buttonDetails = {
        text: 'Submit FRI/CLI report',
        disabled: true,
        dialogType: dialogType.GENERATE_REPORT_DESTINATION
      };
    } else if (state === orderState.IN_TRANSIT) {
      buttonDetails = {
        text: 'Submit FRI/CLI report',
        disabled: false,
        dialogType: dialogType.GENERATE_REPORT_DESTINATION
      };
    } else {
      buttonDetails = {
        text: 'View FRI/CLI report',
        disabled: false,
        dialogType: dialogType.VIEW_REPORT_DESTINATION
      };
    }
    
  } else if (actualRole === OPERATOR) {
    
    
    if (state < orderState.INSPECTED_DESTINATION) {
      buttonDetails = {
        text: 'No FRI/CLI report available',
        disabled: true,
        dialogType: dialogType.SIGN_REPORT_DESTINATION
      };
    } else if (state === orderState.INSPECTED_DESTINATION) {
      buttonDetails = {
        text: 'Sign FRI/CLI report',
        disabled: false,
        dialogType: dialogType.SIGN_REPORT_DESTINATION
      };
    } else {
      buttonDetails = {
        text: 'View FRI/CLI report',
        disabled: false,
        dialogType: dialogType.VIEW_REPORT_DESTINATION
      };
    }
  } else {
    
    if (state <= orderState.IN_TRANSIT) {
      console.log("inside");
      buttonDetails = {
        text: 'No FRI/CLI report available',
        disabled: true,
        dialogType: dialogType.VIEW_REPORT_DESTINATION
      };
    } else {
      
      buttonDetails = {
        text: 'View FRI/CLI report',
        disabled: false,
        dialogType: dialogType.VIEW_REPORT_DESTINATION
      };
    }
  }
  return buttonDetails;
}

export const getGaugingOriginButtonText = (actualRole, state) => {
  let buttonDetails;
  if (actualRole === OPERATOR) {
    if (state < orderState.ORIGIN_EMPTY_GAUGED) {
      buttonDetails = {
        text: 'No gauging report submitted',
        disabled: true,
        dialogType: dialogType.SIGN_GAUGE_ORIGIN
      };
    } else if (state === orderState.ORIGIN_EMPTY_GAUGED || state === orderState.ORIGIN_FULL_GAUGED) {
      buttonDetails = {
        text: 'View and sign gauging details',
        disabled: false,
        dialogType: dialogType.SIGN_GAUGE_ORIGIN
      };
    } else {
      buttonDetails = {
        text: 'View gauging details',
        disabled: false,
        dialogType: dialogType.VIEW_GAUGE_ORIGIN
      };
    }
  } else {
    if (state < orderState.ORIGIN_EMPTY_GAUGED) {
      buttonDetails = {
        text: 'No gauging report available',
        disabled: true,
        dialogType: dialogType.VIEW_GAUGE_ORIGIN
      };
    } else {
      buttonDetails = {
        text: 'View gauging report',
        disabled: false,
        dialogType: dialogType.VIEW_GAUGE_ORIGIN
      };
    }
  }
  return buttonDetails;
}

export const getGaugingDestinationButtonText = (actualRole, state) => {
  let buttonDetails;
  if (actualRole === OPERATOR) {
    if (state < orderState.DESTINATION_FULL_GAUGED) {
      buttonDetails = {
        text: 'No gauging report submitted',
        disabled: true,
        dialogType: dialogType.SIGN_GAUGE_DESTINATION
      };
    } else if (state === orderState.DESTINATION_FULL_GAUGED || state === orderState.DESTINATION_EMPTY_GAUGED) {
      buttonDetails = {
        text: 'View and sign gauging details',
        disabled: false,
        dialogType: dialogType.SIGN_GAUGE_DESTINATION
      };
    } else {
      buttonDetails = {
        text: 'View gauging details',
        disabled: false,
        dialogType: dialogType.VIEW_GAUGE_DESTINATION
      };
    }
    
  } else {
    if (state < orderState.DESTINATION_FULL_GAUGED) {
      buttonDetails = {
        text: 'No gauging report available',
        disabled: true,
        dialogType: dialogType.VIEW_GAUGE_DESTINATION
      };
    } else {
      buttonDetails = {
        text: 'View gauging report',
        disabled: false,
        dialogType: dialogType.VIEW_GAUGE_DESTINATION
      };
    }
  }
  return buttonDetails;
}

const getPublicKey = async (currentAddress) => {
  console.log("Start publicKey");
  let publicKey;
  await window.ethereum.request({
    method: 'eth_getEncryptionPublicKey',
    params: [currentAddress], // you must have access to the specified account
  })
  .then((result) => {
    publicKey = result;
  })
  .catch((error) => {
    if (error.code === 4001) {
      // EIP-1193 userRejectedRequest error
      console.log("We can't encrypt anything without the key.");
    } else {
      console.error(error);
    }
  });
  console.log("End publicKey");
  return publicKey;
};


const doChallenge = async (challenge, currentAddress) => {
  console.log("Start doCHallenge");
  let message;
  await window.ethereum.request({
    method: 'eth_decrypt',
    params: [challenge, currentAddress],
  })
  .then((decryptedMessage) => {
    message = decryptedMessage;
  })
  .catch((error) => console.log(error.message));
  console.log("End doChallenge");
  return message
};

const getChallenge = async (orderAddr, currAddress, pubKey) => {
  console.log("Start getCHallenge");
  let challengeResponse;
  try {
    challengeResponse = await axios.post('http://localhost:3004/challenge', {
      orderAddr,
      did: currAddress,
      publicKey: pubKey
    });
  } catch (error) {
    console.log(error);
  }
  console.log("End get challenge");
  return challengeResponse.data.challenge;
};

const encryptChallenge = async (challengeString) => {
  // Encrypt data with off-chain's pub key
  console.log("Start encryptCHallenge");
  const encrypted = await EthCrypto.encryptWithPublicKey(
    VERIFIER_PUB_Key, 
    JSON.stringify(challengeString)
  );
  console.log("End decryptChallenge");
  return EthCrypto.cipher.stringify(encrypted);
};

const writeDataRequest = async (orderAddr, did, encryptedChallenge, data) => {

  const dataUuid = ethers.utils.id(data);
  console.log("Start request");
  await axios.post('http://localhost:3004/write', {
    orderAddr,
    did,
    challenge: encryptedChallenge,
    uuid: dataUuid,
    data,
  });
  console.log("End request");
};

export const writeData = async (currAddress, orderAddr, data) => {
  console.log("Start write data");
  const pubKey = await getPublicKey(currAddress);

  const challenge = await getChallenge(orderAddr, currAddress, pubKey);

  const challengeString = await doChallenge(challenge, currAddress);

  const encryptedChallenge = await encryptChallenge(challengeString);
  console.log("End write data");
  await writeDataRequest(orderAddr, currAddress, encryptedChallenge, data);
  
};

const readDataRequest = async (orderAddr, did, encryptedChallenge, uuid) => {

  return await axios.post('http://localhost:3004/read', {
    orderAddr,
    did,
    challenge: encryptedChallenge,
    uuid
  });

};

export const readData = async (currAddress, orderAddr, uuid) => {

  const pubKey = await getPublicKey(currAddress);

  const challenge = await getChallenge(orderAddr, currAddress, pubKey);

  const challengeString = await doChallenge(challenge, currAddress);

  const encryptedChallenge = await encryptChallenge(challengeString);
  
  return await readDataRequest(orderAddr, currAddress, encryptedChallenge, uuid);
};