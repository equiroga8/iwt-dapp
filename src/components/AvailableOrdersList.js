import { makeStyles } from '@material-ui/core/styles';
import TransportationOrderFactory from '../artifacts/contracts/TransportationOrderFactory.sol/TransportationOrderFactory.json';
import TransportationOrder from '../artifacts/contracts/TransportationOrder.sol/TransportationOrder.json';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { Container, Grid } from '@material-ui/core';
import AvailableOrder from './AvailableOrder';


const FACT_ADDR = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 460,
  },
  inputWrapper: {
    width: '95%',
    marginLeft: 10,
  },
  input: {
    width: '100%',
  },
  test: {
    width: '100%',
    background: 'red',
  },
}));



export default function OrderForm() {

  const classes = useStyles();

  const [ordersData, setOrdersData] = useState([])

  useEffect(() => getTransportationOrders(), []);

  async function getTransportationOrders() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(FACT_ADDR, TransportationOrderFactory.abi, provider);
      const transportationOrders = await contract.getTransportOrders();
      let newOrdersData = [];
      for (let transportationOrder of transportationOrders) {
        const orderContract = new ethers.Contract(transportationOrder, TransportationOrder.abi, provider);
        const destinationPort = await orderContract.destinationPort();
        const originPort = await orderContract.originPort();
        const client = await orderContract.client();
        const orderPayout = await orderContract.orderPayout();
        const cargoType = await orderContract.cargoType();
        const deadline = await orderContract.deadline();
        newOrdersData.push({
          address: transportationOrder, 
          originPort,
          destinationPort,
          client,
          orderPayout,
          cargoType,
          deadline
        });
      }
      console.log(newOrdersData);
      setOrdersData(newOrdersData);
    }
  }

  return (
    <Container>
      <Grid>
        {ordersData.map((orderData, index) => 
          <AvailableOrder key={index} orderData={orderData} />
        )}
      </Grid> 
    </Container>
  );
}
