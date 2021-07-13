import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import { Container } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import FiberManualRecordOutlinedIcon from '@material-ui/icons/FiberManualRecordOutlined';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import CategoryIcon from '@material-ui/icons/Category';
import EventIcon from '@material-ui/icons/Event';
import { hexToDate, hexToInt, hexToString, WEI_VAL } from '../helper';

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

});

export default function AvailableOrder(props) {
  const classes = useStyles();

  return (
    <Container>
      <Card className={classes.root}>
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
                        {props.orderData.originPort}
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
                      {hexToString(props.orderData.destinationPort)}
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
              <Grid item xs={12} container>
                <Button
                  variant="contained"
                  color="secondary"
                  className={classes.button}
                  startIcon={<CloudUploadOutlinedIcon />}
                  style={{ marginTop: 50 }}
                >
                  Upload Credential(s)
                </Button>
              </Grid>
            </Grid>
            <Grid item sm={6} xs={12} container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" style={{ fontSize: 20 }}>
                  Type: {props.orderData.cargoType} 
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
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<AccountCircleOutlinedIcon />}
          >
            Apply for operator
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
}
