import React, { useState } from 'react';
import { makeStyles, styled } from '@material-ui/core/styles';
import {Grid, CircularProgress, Card, Fab, CardActions, CardContent, Button, Typography, Container, Divider } from '@material-ui/core';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import FiberManualRecordOutlinedIcon from '@material-ui/icons/FiberManualRecordOutlined';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import CategoryIcon from '@material-ui/icons/Category';
import EventIcon from '@material-ui/icons/Event';
import { hexToDate, hexToInt, hexToPortName, WEI_VAL, readAllFiles, hashObjects, cargoTypes } from '../helper';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
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


export default function AvailableOrder(props) {
  const classes = useStyles();
  
  const [credentials, setCredentials] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

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
              sm={9}
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
                  <Grid className={classes.adjustIcon}>
                    <FiberManualRecordOutlinedIcon style={{ marginBottom: 0 }}/>
                  </Grid>
                  <Grid>
                    <Typography color="textSecondary" noWrap>
                        {hexToPortName(props.orderData.originPort)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={1} container justify = "center" noWrap>
                    <Grid item>
                      <ArrowForwardIcon className={classes.arrowIcon}/>
                    </Grid>
                </Grid>
                <Grid item xs={2} container>
                  <Grid>
                    <LocationOnOutlinedIcon/>
                  </Grid>
                  <Grid>
                    <Typography color="textSecondary">
                      {hexToPortName(props.orderData.destinationPort)}
                    </Typography>
                  </Grid>
                </Grid>    
            </Grid>
            <Grid item sm={3} xs={12}>
              <Typography variant="h3" component="h3">
                {hexToInt(props.orderData.orderPayout._hex) / WEI_VAL} Ξ
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider/>
            </Grid>
            <Grid item sm={6} xs={12} container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="h6" component="h6">
                  Required credentials:
                </Typography>
              </Grid>
              <Grid item sm={8} xs={12} container>
                <Typography variant="subtitle1" component="h6">
                  - Boating licence
                </Typography>
              </Grid>
              {credentials.length !== 0 && 
                <Grid item sm={8} xs={12} container>
                  <Typography variant="body2" component="h6">
                    {hashObjects(credentials)}
                  </Typography>
                </Grid>
              }
              <Grid item xs={12} container>
              <label htmlFor="upload-cred">
                <input
                  style={{ display: 'none' }}
                  id="upload-cred"
                  name="upload-cred"
                  type="file"
                  multiple
                  onChange={(e) => handleChange(e)}
                />

                <Fab
                  color="secondary"
                  size="medium"
                  component="span"
                  aria-label="upload"
                  variant="extended"
                  disabled={loadingFiles}
                >
                  {credentials.length === 0 ? 
                  <CloudUploadOutlinedIcon style={{ marginRight: 7 }}/> :
                  <CloudDoneIcon style={{ marginRight: 7 }}/>
                  }
                  Upload credential(s)
                  </Fab>
                  {loadingFiles && <CircularProgress size={24} className={classes.buttonProgress} />}
                </label>
              </Grid>
            </Grid>
            <Grid item sm={6} xs={12} container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" style={{ fontSize: 20 }}>
                  Cargo type: {cargoTypes.get(props.orderData.cargoType)} 
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" style={{ fontSize: 20 }}>
                  Deadline: {hexToDate(props.orderData.deadline._hex)} 
                </Typography>
              </Grid>
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
              Apply for operator
            </Button>
          </Grid>
        </CardActions>
      </Card>
    </Container>
  );
}
