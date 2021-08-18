import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Grid, Card, CardActions, CardContent, Button, Typography, Container, Divider, CircularProgress } from '@material-ui/core';
import OrderDetails from './OrderDetails';
import FiberManualRecordOutlinedIcon from '@material-ui/icons/FiberManualRecordOutlined';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import IconTitle from './IconTitle';
import OrderRequiredCredentials from './OrderRequiredCredentials';
import { readAllFiles, VERIFIER_PUB_Key, OPERATOR, DESTINATION_INSPECTOR, ORIGIN_INSPECTOR, LOGGER_ADDR } from '../helper';
import { uploadCredentialsToDDB } from '../ddbMethods';
import EthCrypto from 'eth-crypto';
import TransportationOrder from '../artifacts/contracts/TransportationOrder.sol/TransportationOrder.json';
import TransportationOrderLogger from '../artifacts/contracts/TransportationOrderLogger.sol/TransportationOrderLogger.json';
import { ethers } from 'ethers';
import { useHistory } from 'react-router-dom';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
    padding: 10
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  cardPadding: {
    marginTop: 5,
    marginBottom: 10,
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
}));

export default function OrderCard(props) {

  const classes = useStyles();

  const history = useHistory();

  const [credentials, setCredentials] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uuid, setUuid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


 useEffect(()=>{
    const uploadCredentials = async () => {
      
      const encrypted = await EthCrypto.encryptWithPublicKey(
        VERIFIER_PUB_Key, 
        JSON.stringify(credentials)
      );
      const encryptedString = EthCrypto.cipher.stringify(encrypted);
      const newUuid = ethers.utils.id(encryptedString);
      setUuid(newUuid);
      uploadCredentialsToDDB('Credentials', newUuid, encryptedString);

    }
    if (credentials.length !== 0) {
      uploadCredentials();
    }
 }, [credentials]);

  const handleClick = async () => {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const orderContract = new ethers.Contract(props.orderData.address, TransportationOrder.abi, signer);
    const loggerContract = new ethers.Contract(LOGGER_ADDR, TransportationOrderLogger.abi, signer);
    try  {
      if (props.role === OPERATOR) {
        const transaction = await orderContract.requestOperatorRole(uuid);
        await transaction.wait();
        await loggerContract.once('OrderAssigned', async (orderAddr, operatorDID, success) => {
          console.log(`OrderAssigned ${success}: to ${operatorDID} for order ${orderAddr}`);
          action(operatorDID, address, success);
        });
  
      } else if (props.role === ORIGIN_INSPECTOR) {
        const transaction = await orderContract.requestOriginInspectorRole(uuid);
        await transaction.wait();
        await loggerContract.once('InspectorOriginRoleAssigned', async (orderAddr, inspectorDID, success) => {
          console.log(`InspectorOriginRoleAssigned ${success}: to ${inspectorDID} for order ${orderAddr}`);          
          action(inspectorDID, address, success);
        });
  
      } else if (props.role === DESTINATION_INSPECTOR) {
        const transaction = await orderContract.requestDestinationInspectorRole(uuid);
        await transaction.wait();
        await loggerContract.once('InspectorDestinationRoleAssigned', async (orderAddr, inspectorDID, success) => {
          console.log(`InspectorDestinationRoleAssigned ${success}: to ${inspectorDID} for order ${orderAddr}`);          
          action(inspectorDID, address, success);
        });
      }
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
    
  }

  const action = (did, actualDID, success) => {
    if (did === actualDID) {
      if (success) {
        history.push(`/my-orders`);
        setError("");
      }
      setLoading(false);
      setError("Verification was unsuccesful, please choose the correct credentials."); 
    }
  }

  const handleChange = (e) => {
    setLoadingFiles(true);

    let AllFiles = [];
    [...e.target.files].map(file => AllFiles.push(file));
    let parsedFiles = []
    readAllFiles(AllFiles)
      .then(results => {
        for (let result of results) {
            parsedFiles.push(JSON.parse(result));
        }
        setCredentials(parsedFiles);
      })
      .catch(err => {
        console.error(err);
      });
    
    setLoadingFiles(false);
  };

  return (
    <Container className={classes.cardPadding}>
      <Card className={classes.root} elevation={3}>
        <CardContent>
          <Grid container spacing={1}>
            <Grid  
              item
              sm={10}
              xs={12}
              container
              spacing={2}
            >
              <Grid item xs={12}>
                <Typography variant="h5" component="h2" noWrap>
                  {props.orderData.address}
                </Typography>
              </Grid>
              <Grid item xs={2} container >
                  <IconTitle icon={<FiberManualRecordOutlinedIcon/>} text={props.orderData.originPort} color={"textSecondary"}/>
              </Grid>
                <Grid item xs={1} container noWrap>
                    <Grid item>
                      <ArrowForwardIcon className={classes.arrowIcon}/>
                    </Grid>
                </Grid>
                <Grid item xs={2} container>
                  <IconTitle icon={<LocationOnOutlinedIcon/>} text={props.orderData.destinationPort} color={"textSecondary"}/>
                </Grid>    
            </Grid>
            <Grid item sm={2} xs={12}>
              <Typography variant="h3" component="h3">
                {props.orderData.orderPayout} Ξ
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider/>
            </Grid>
            <Grid item sm={6} xs={12} container spacing={1}>
              <OrderRequiredCredentials 
                credentials={credentials} 
                handleChange={handleChange} 
                loadingFiles={loadingFiles}
                role={props.role}
              />
            </Grid>
            <Grid item sm={6} xs={12} container spacing={1}>
              <OrderDetails
                orderState={props.orderData.orderState} 
                deadline={props.orderData.deadline} 
                cargoType={props.orderData.cargoType} 
                client={props.orderData.client}
                cargoLoad={props.orderData.cargoLoad}
              />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Grid container direction="row-reverse">
          <div className={classes.wrapper}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              startIcon={<AccountCircleOutlinedIcon />}
              disabled={credentials.length === 0 || loading}
              onClick={handleClick}
            >
              Apply for {props.role} role
            </Button>
            {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
          </Grid>       
        </CardActions>
        <CardContent>
        { error !== "" &&       
            <Grid item xs={12}>
              <Alert severity="error" variant="outlined">
                {error}
              </Alert>
            </Grid>
          }
        </CardContent>
      </Card>
    </Container>
  );
}
