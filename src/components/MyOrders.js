import { makeStyles } from '@material-ui/core/styles';
import TransportationOrderFactory from '../artifacts/contracts/TransportationOrderFactory.sol/TransportationOrderFactory.json';
import TransportationOrder from '../artifacts/contracts/TransportationOrder.sol/TransportationOrder.json';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import OrderCard from './OrderCard';
import { FACT_ADDR, hexToInt, WEI_VAL, hexToPortName, cargoTypes, filterByAddress } from '../helper';

const useStyles = makeStyles((theme) => ({
  filtersContainer: {
    borderRight: "1px solid black"
  },
}));

export default function MyOrders() {

   const classes = useStyles();

  const [ordersData, setOrdersData] = useState([]);

  useEffect(() => getTransportationOrders(), []);

  const getTransportationOrders = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(FACT_ADDR, TransportationOrderFactory.abi, provider);
        let transportationOrders = await contract.getTransportOrders();
        let newOrdersData = [];
        for (let i = transportationOrders.length - 1; i >= 0; i--) {
          const orderContract = new ethers.Contract(transportationOrders[i], TransportationOrder.abi, provider);
          const destinationPort = await orderContract.destinationPort();
          const originPort = await orderContract.originPort();
          const client = await orderContract.client();
          const orderPayout = await orderContract.orderPayout();
          const cargoType = await orderContract.cargoType();
          const deadline = await orderContract.deadline();
          const orderState = await orderContract.orderState();
          const cargoLoad = await orderContract.cargoLoad();
          const cargoDetailsOrigin = await orderContract.cargoDetailsOrigin();
          const cargoDetailsDestination = await orderContract.cargoDetailsDestination();
          const originGauge = await orderContract.originGauge();
          const destinationGauge = await orderContract.destinationGauge();
          const operator = await orderContract.operator();
          const gaugingSensor = await orderContract.gaugingSensor();
          const cargoInspectorOrigin = await orderContract.cargoInspectorOrigin();
          const cargoInspectorDestination = await orderContract.cargoInspectorDestination();

          // Get every attribute.
          newOrdersData.push({
            address: transportationOrders[i], 
            originPort: hexToPortName(originPort),
            destinationPort: hexToPortName(destinationPort),
            client,
            orderPayout: hexToInt(orderPayout._hex) / WEI_VAL,
            cargoType: cargoTypes.get(cargoType),
            deadline: hexToInt(deadline._hex),
            orderState,
            cargoLoad: hexToInt(cargoLoad._hex) / 100,
            cargoDetailsOrigin,
            cargoDetailsDestination,
            originGauge,
            destinationGauge,
            operator,
            gaugingSensor,
            cargoInspectorDestination,
            cargoInspectorOrigin
          });
        }
        //console.log(JSON.stringify({ orders: newOrdersData}));
        const signer = provider.getSigner();
        setOrdersData(filterByAddress(newOrdersData, await signer.getAddress()));
      } catch (err) {
        console.log(err);
      }
      
    }
  }

  return (
    <Grid container spacing={0}>
      <Grid item xs={10}>
        {ordersData.map((orderData, index) => 
          <OrderCard key={index} orderData={orderData}/>
        )}
      </Grid>
    </Grid> 
  );
}
