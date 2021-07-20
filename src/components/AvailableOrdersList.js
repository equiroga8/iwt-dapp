import { makeStyles } from '@material-ui/core/styles';
import TransportationOrderFactory from '../artifacts/contracts/TransportationOrderFactory.sol/TransportationOrderFactory.json';
import TransportationOrder from '../artifacts/contracts/TransportationOrder.sol/TransportationOrder.json';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { Container, Grid } from '@material-ui/core';
import AvailableOrder from './AvailableOrder';
import { orderState, filterByState } from '../helper';


const FACT_ADDR = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

const useStyles = makeStyles((theme) => ({

}));



export default function OrderForm() {

  const classes = useStyles();

  const [ordersData, setOrdersData] = useState([])

  useEffect(() => getTransportationOrders(), []);

  async function getTransportationOrders() {
    if (typeof window.ethereum !== 'undefined') {
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
        newOrdersData.push({
          address: transportationOrders[i], 
          originPort,
          destinationPort,
          client,
          orderPayout,
          cargoType,
          deadline,
          orderState
        });
      }
      setOrdersData(filterByState(newOrdersData, orderState.INITIAL));
    }
  }

  return (
    <Container>
      <Grid container spacing={8}>
        {ordersData.map((orderData, index) => 
          <AvailableOrder key={index} orderData={orderData}/>
        )}
      </Grid> 
    </Container>
  );
}
