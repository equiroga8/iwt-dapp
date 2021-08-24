#!/bin/bash

mkdir db
cd db
wget  -P . "https://s3.eu-central-1.amazonaws.com/dynamodb-local-frankfurt/dynamodb_local_latest.tar.gz"
tar -xvzf dynamodb_local_latest.tar.gz
rm dynamodb_local_latest.tar.gz

gnome-terminal -x bash -c "java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb"

cd ..
npm install

npx hardhat compile

gnome-terminal -x bash -c "npx hardhat node"

npx hardhat run scripts/deploy.js --network localhost

gnome-terminal -x bash -c "npm start"

gnome-terminal -x bash -c "node sensor/gauger.js"

gnome-terminal -x bash -c "node off-chain/app.js"
