import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {Grid, Card, CardActions, CardContent, Button, Typography, Container, Divider, Collapse } from '@material-ui/core';
import OrderDetails from './OrderDetails';
import FiberManualRecordOutlinedIcon from '@material-ui/icons/FiberManualRecordOutlined';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconTitle from './IconTitle';
import OrderParticipants from './OrderParticipants';
import InspectionSection from './InspectionSection';
import GaugingSection from './GaugingSection';
import OrderDialog from './OrderDialog';
import {getGaugingOriginButtonText, getInspectionDestinationButtonText, getGaugingDestinationButtonText, getInspectionOriginButtonText, DESTINATION_INSPECTOR, OPERATOR, ORIGIN_INSPECTOR, CLIENT, GAUGER} from '../helper';
import clsx from 'clsx';
import { ethers } from 'ethers';

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
  topMargin:{
    marginTop: 5
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  paper: {
    width: '80%',
    maxHeight: 635,
  },

}));

export default function OrderCardExtra(props) {
  
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (newValue) => {
    setOpen(false);
  };
  const classes = useStyles();

  const [expanded, setExpanded] = useState(false);
  const [role, setRole] = useState(OPERATOR);
  const [currentDialogType, setCurrentDialogType] = useState(0);

  const [buttonDetails, setButtonDetails] = useState(
    {
      originGauge: getGaugingOriginButtonText(props.orderData.orderState, role),
      destinationGauge: getGaugingDestinationButtonText(props.orderData.orderState, role),
      inspectionOrigin: getInspectionOriginButtonText(props.orderData.orderState, role),
      inspectionDestination: getInspectionDestinationButtonText(props.orderData.orderState, role)
    }
  );

  

  useEffect(() => {
    const getRoleFromAddr = (address) => {
      let role = GAUGER;
      if (address === props.orderData.operator[1]) {
        role = OPERATOR;
      } else if (address === props.orderData.cargoInspectorOrigin[1]) {
        role= ORIGIN_INSPECTOR;
      } else if (address === props.orderData.cargoInspectorDestination[1]) {
        role = DESTINATION_INSPECTOR;
      } else if (address === props.orderData.client) {
        role = CLIENT;
      }
      return role;
    }
    async function listenMMAccount() {
      window.ethereum.removeAllListeners();
      window.ethereum.on("accountsChanged", async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const newRole = getRoleFromAddr(address);
        //console.log("New Role: " + newRole)
        setRole(newRole);
      });
    }
    listenMMAccount();
  }, []);

  useEffect(() => {
    setButtonDetails({
      originGauge: getGaugingOriginButtonText(role, props.orderData.orderState),
      destinationGauge: getGaugingDestinationButtonText(role, props.orderData.orderState),
      inspectionOrigin: getInspectionOriginButtonText(role, props.orderData.orderState),
      inspectionDestination: getInspectionDestinationButtonText(role, props.orderData.orderState)
    });
  }, [role, props.orderData.orderState]);

  
  
  

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Container className={classes.cardPadding}>
      <Card className={classes.root} elevation={3}>
        <CardContent>
          <Grid container spacing={1} style={{marginBottom: 20}}>
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
              <OrderDetails
                orderState={props.orderData.orderState} 
                deadline={props.orderData.deadline} 
                cargoType={props.orderData.cargoType} 
                client={props.orderData.client}
                cargoLoad={props.orderData.cargoLoad}
                role={role}
              />
            </Grid>
            <Grid item sm={6} xs={12} container spacing={1}>
              <OrderParticipants
                role={role}
                operator={props.orderData.operator[1]} 
                gaugingSensor={props.orderData.gaugingSensor[1]} 
                cargoInspectorOrigin={props.orderData.cargoInspectorOrigin[1]} 
                cargoInspectorDestination={props.orderData.cargoInspectorDestination[1]}
              />
            </Grid>
          </Grid>
          <Divider variant="middle" />
          </CardContent>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <CardContent>
            <Grid container style={{paddingBottom: 10}}>
              <InspectionSection
                inspectionOrigin={buttonDetails.inspectionOrigin}
                inspectionDestination={buttonDetails.inspectionDestination}
                handleClick={handleClick}
                setCurrentDialogType={setCurrentDialogType}
              />
              </Grid>  
              <Divider variant="middle" />
              <Grid container style={{paddingBottom: 10, paddingTop: 35}}>
              <GaugingSection 
                originGauge={buttonDetails.originGauge}
                destinationGauge={buttonDetails.destinationGauge}
                handleClick={handleClick}
                setCurrentDialogType={setCurrentDialogType}
              />
              </Grid>  
              <Divider variant="middle" />
           
          </CardContent>
        </Collapse>
        <CardActions>
          <Grid container direction="row" justifyContent="center" alignItems="center">
            <Button
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
              startIcon={<ExpandMoreIcon className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}/>}
            >
            {expanded ? "Show less" : "Show more"}
            </Button>
          </Grid>
        </CardActions>
      </Card>
      <OrderDialog
          classes={{
            paper: classes.paper,
          }}
          id="order-dialog"
          keepMounted
          open={open}
          onClose={handleClose}
          dialogType={currentDialogType}
        />
    </Container>
  );
}

OrderCardExtra.defaultProps = {
  orderData:{
    address: '0xa16E02E87b7454126E5E10d957A927A7F5B5d2be', 
    originPort: "Bonn",
    destinationPort: "Dresden",
    client: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    orderPayout: 3.35,
    cargoType: 'Piece',
    deadline: 22/11/1990,
    orderState: 1,
    cargoLoad: 12.3,
    cargoDetailsOrigin: '0x123abc0000000000000000000000000000000000000000000000000000000000',
    cargoDetailsDestination: '0x0000000000000000000000000000000000000000000000000000000000000000',
    originGauge: '0x123abc0000000000000000000000000000000000000000000000000000000000',
    destinationGauge: '0x0000000000000000000000000000000000000000000000000000000000000000',
    operator: ['','0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'],
    gaugingSensor: ['','0x70997970C51812dc3A010C7d01b50e0d17dc79C8'],
    cargoInspectorOrigin: ['','0x90F79bf6EB2c4f870365E785982E1f101E93b906'],
    cargoInspectorDestination: ['','0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65']
  }
}