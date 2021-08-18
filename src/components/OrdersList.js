import { makeStyles } from '@material-ui/core/styles';
import TransportationOrderFactory from '../artifacts/contracts/TransportationOrderFactory.sol/TransportationOrderFactory.json';
import TransportationOrder from '../artifacts/contracts/TransportationOrder.sol/TransportationOrder.json';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { Grid, CircularProgress, Typography } from '@material-ui/core';
import OrderCard from './OrderCard';
import FiltersSection from './FiltersSection';
import { FACT_ADDR, hexToInt, WEI_VAL, hexToPortName, cargoTypes, refineOrders, minPayout, maxPayout, OPERATOR } from '../helper';

const useStyles = makeStyles((theme) => ({
}));


export default function OrdersList() {

   const classes = useStyles();

  const [ordersData, setOrdersData] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [role, setRole] = useState(OPERATOR);
  const [loading, setLoading] = useState(false);

  useEffect(() => getTransportationOrders(), []);
  // Esto hay que revisarlo
  useEffect(() => setFilteredOrders(refineOrders(ordersData, {role: OPERATOR})), [ordersData]);

  const filterOrders = (refinements) => {
    setFilteredOrders(refineOrders(ordersData, refinements));
  }

  const getTransportationOrders = async () => {
    setLoading(true);
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
        setOrdersData(newOrdersData);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    }
  }

  return (
    <Grid container spacing={0}>
      <Grid item xs={2}>
        <FiltersSection 
          filterOrders={filterOrders}
          minPayout={minPayout(ordersData)}
          maxPayout={maxPayout(ordersData)}
          role={role}
          setRole={setRole}
        />
      </Grid>
      
      <Grid item container xs={10} direction="row"
  justifyContent="center"
  alignItems="center">
        {loading ? (
          <CircularProgress size={44} className={classes.buttonProgress} />
        ) : (
          filteredOrders.length === 0 ? (
            <Typography variant="h5" component="h2">
              No orders available.
            </Typography>
          ) : (
            filteredOrders.map((orderData, index) => 
              <OrderCard key={index} orderData={orderData} role={role}/>
            )
          )
        )}
        
        
      </Grid>
    </Grid> 
  );
}
