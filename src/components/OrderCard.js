import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Grid, Card, CardActions, CardContent, Button, Typography, Container, Divider } from '@material-ui/core';
import OrderDetails from './OrderDetails';
import FiberManualRecordOutlinedIcon from '@material-ui/icons/FiberManualRecordOutlined';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import IconTitle from './IconTitle';
import OrderRequiredCredentials from './OrderRequiredCredentials';
import { readAllFiles, VERIFIER_PUB_Key, hashObjects } from '../helper';
import { uploadCredentialsToDDB } from '../ddbMethods';
import EthCrypto from 'eth-crypto';

const useStyles = makeStyles({
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

});

export default function OrderCard(props) {

  const classes = useStyles();

  const [credentials, setCredentials] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);


 useEffect(()=>{
    const uploadCredentials = async () => {
      //console.log(credentials);
      const encrypted = await EthCrypto.encryptWithPublicKey(
        VERIFIER_PUB_Key, 
        JSON.stringify(credentials)
      );

      const encryptedString = EthCrypto.cipher.stringify(encrypted);
      //console.log(encryptedString);
      uploadCredentialsToDDB('Credentials', hashObjects(credentials), encryptedString);

    }
    if (credentials.length !== 0) {
      uploadCredentials();
    }
 }, [credentials]);

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
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              startIcon={<AccountCircleOutlinedIcon />}
              disabled={credentials.length === 0}
            >
              Apply for {props.role} role
            </Button>
          </Grid>
        </CardActions>
      </Card>
    </Container>
  );
}
