import { makeStyles } from '@material-ui/core/styles';
import TransportationOrderFactory from '../artifacts/contracts/TransportationOrderFactory.sol/TransportationOrderFactory.json';
import TransportationOrder from '../artifacts/contracts/TransportationOrder.sol/TransportationOrder.json';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import OrderCard from './OrderCard';
import FiltersSection from './FiltersSection';
import { orderState, filterByState } from '../helper';

const FACT_ADDR = '0x5fbdb2315678afecb367f032d93f642f64180aa3';


const useStyles = makeStyles((theme) => ({
  filtersContainer: {
    borderRight: "1px solid black"
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
        newOrdersData.push({
          address: transportationOrders[i], 
          originPort,
          destinationPort,
          client,
          orderPayout,
          cargoType,
          deadline,
          orderState,
          cargoLoad
        });
      }
      setOrdersData(filterByState(newOrdersData, orderState.INITIAL));
    }
  }

  return (
    <Grid container spacing={0}>
      <Grid item xs={2} className={classes.filtersContainer}>
        <FiltersSection />
      </Grid>
      <Grid item xs={10}>
        {ordersData.map((orderData, index) => 
          <OrderCard key={index} orderData={orderData} onlyInitial={true}/>
        )}
      </Grid>
    </Grid> 
  );
}
