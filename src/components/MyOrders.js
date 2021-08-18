import { makeStyles } from '@material-ui/core/styles';
import TransportationOrderFactory from '../artifacts/contracts/TransportationOrderFactory.sol/TransportationOrderFactory.json';
import TransportationOrder from '../artifacts/contracts/TransportationOrder.sol/TransportationOrder.json';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { Grid, CircularProgress, Typography } from '@material-ui/core';
import OrderCardExtra from './OrderCardExtra';
import { FACT_ADDR, hexToInt, WEI_VAL, hexToPortName, cargoTypes, filterByAddress } from '../helper';

const useStyles = makeStyles((theme) => ({
  filtersContainer: {
    borderRight: "1px solid black"
  },
}));

export default function MyOrders() {

   const classes = useStyles();

  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currAddress, setCurrAddress] = useState('');
  const [currSigner, setCurrSigner] = useState('');
  const [reload, setReload] = useState('');
  const [focusedAddr, setFocusedAddr] = useState('');
  const [focusedOrder, setFocusedOrder] = useState();

  useEffect(() => {
    async function listenMMAccount() {
      window.ethereum.removeAllListeners();
      window.ethereum.on("accountsChanged", async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setCurrSigner(signer);
        setCurrAddress(address);
      });
    }
    async function getInitialAddress() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setCurrAddress(address);
      setCurrSigner(signer)
    }
    listenMMAccount();
    getInitialAddress();
  }, []);

  useEffect(() => {
    if (reload !== '') {
      
      const getOrder = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const orderContract = new ethers.Contract(reload, TransportationOrder.abi, provider);
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
        setFocusedOrder({
          address: reload, 
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
      getOrder();
      setReload('');
    }
  }, [reload]);

  useEffect(() => {
    
    getTransportationOrders();
    
  }, [currAddress]);
  
  useEffect(() => {
    if (focusedAddr !== '') {
      const newFocusedOrder = ordersData.find(order => order.address === focusedAddr);
      setFocusedOrder(newFocusedOrder);
    }
  }, [focusedAddr])

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
        const filteredOrders = filterByAddress(newOrdersData, currAddress);

        setOrdersData(filteredOrders);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    }
  }

  return (   
    <Grid 
      item 
      container 
      xs={10} 
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      {loading ? (
        <CircularProgress size={44} className={classes.buttonProgress} />
      ) : (
        (ordersData.length === 0) ? (
          <Typography variant="h5" component="h2">
            No orders available.
          </Typography>
        ) : ( focusedAddr === '' ? (
          ordersData.map((orderData, index) => 
            <OrderCardExtra 
              key={index} 
              orderData={orderData} 
              currAddress={currAddress}
              setReload={setReload}
              setFocusedAddr={setFocusedAddr}
            />
          )) : (
            
            <OrderCardExtra 
              orderData={focusedOrder} 
              currAddress={currAddress}
              setReload={setReload}
              setFocusedAddr={setFocusedAddr}
              shouldBeExpanded={true}
              currSigner={currSigner}
            />
          )
        )  
        )
      }
    </Grid>
  );
}
