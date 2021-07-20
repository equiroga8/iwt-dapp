import { ethers } from 'ethers';

export const WEI_VAL = 1000000000000000000; 
export const VALIDATOR_ADDR = 0x1234;

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
    INSPECTED: 2, 
    ORIGIN_GAUGING: 3,
    IN_TRANSIT: 4, 
    DESTINATION_GAUGING: 5, 
    COMPLETED: 6, 
    CANCELED: 7
};

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


export const filterByState = (orders, state) => {
  let filteredOrders = [];
  let currentDate = new Date();
  for (let order of orders) {
    if (order.orderState === state && order.deadline > currentDate.getTime()) {
      filteredOrders.push(order);
    } 
  }
  return filteredOrders;
}
