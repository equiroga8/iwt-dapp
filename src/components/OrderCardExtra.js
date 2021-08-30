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
import TransportationOrder from '../artifacts/contracts/TransportationOrder.sol/TransportationOrder.json';
import TransportationOrderLogger from '../artifacts/contracts/TransportationOrderLogger.sol/TransportationOrderLogger.json';
import {getGaugingOriginButtonText, getInspectionDestinationButtonText, getGaugingDestinationButtonText, getInspectionOriginButtonText, DESTINATION_INSPECTOR, OPERATOR, ORIGIN_INSPECTOR, CLIENT, GAUGER, orderState, dialogType, LOGGER_ADDR, GAUGING_DETAILS_TEMPL, INSP_DETAILS_TEMPL, writeData, readData} from '../helper';
import clsx from 'clsx';
import Alert from '@material-ui/lab/Alert';
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

  const classes = useStyles();

  const [expanded, setExpanded] = useState(props.shouldBeExpanded);
  const [role, setRole] = useState(OPERATOR);
  const [currentDialogType, setCurrentDialogType] = useState(0);
  const [logger, setLogger] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [open, setOpen] = useState(false);
  const [gaugingDetails, setGaugingDetails] = useState(GAUGING_DETAILS_TEMPL);
  const [inspectionOriginReport, setInspectionOriginReport] = useState(INSP_DETAILS_TEMPL);
  const [inspectionDestinationReport, setInspectionDestinationReport] = useState(INSP_DETAILS_TEMPL);


  const handleClick = async (clickedDialog) => {

    if (clickedDialog === dialogType.SIGN_GAUGE_ORIGIN || 
      clickedDialog === dialogType.VIEW_GAUGE_ORIGIN) {
        // HERE READ
        const details = await readData(props.currAddress, props.orderData.address, props.orderData.originGauge);
        setGaugingDetails(JSON.parse(details.data.response.Item.data));
    } else if (clickedDialog === dialogType.SIGN_GAUGE_DESTINATION ||
      clickedDialog === dialogType.VIEW_GAUGE_DESTINATION) {
      // HERE READ
      const details = await readData(props.currAddress, props.orderData.address, props.orderData.destinationGauge);
      setGaugingDetails(JSON.parse(details.data.response.Item.data));
    } else if (clickedDialog === dialogType.VIEW_REPORT_ORIGIN || clickedDialog ===dialogType.SIGN_REPORT_ORIGIN) {
      // HERE READ
      const details = await readData(props.currAddress, props.orderData.address, props.orderData.cargoDetailsOrigin);
      setInspectionOriginReport(JSON.parse(details.data.response.Item.data));
    } else if (clickedDialog === dialogType.VIEW_REPORT_DESTINATION || clickedDialog === dialogType.SIGN_REPORT_DESTINATION) {
      // HERE READ
      const details = await readData(props.currAddress, props.orderData.address, props.orderData.cargoDetailsDestination);
      setInspectionDestinationReport(JSON.parse(details.data.response.Item.data));
    } 
  
    setOpen(true);
  };

  const handleCancelOrder = async () => {
    
    const transportationOrder = new ethers.Contract(props.orderData.address, TransportationOrder.abi, props.currSigner);
    const transaction = await transportationOrder.cancelOrder();
    await transaction.wait();
    await delay(2000);

  };

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const handleClose = async (action) => {

    let newGaugingData = JSON.parse(JSON.stringify(gaugingDetails));
    setLoadingDialog(true);
    if (currentDialogType === dialogType.SIGN_GAUGE_ORIGIN && action === "sign") {

      if (newGaugingData.originEmpty.operatorSignature === null) {
        const newSignature = await props.currSigner.signMessage(JSON.stringify(newGaugingData.originEmpty.reading));
        newGaugingData.originEmpty.operatorSignature = newSignature;

      } else {
        const newSignature = await props.currSigner.signMessage(JSON.stringify(newGaugingData.originFull.reading));
        newGaugingData.originFull.operatorSignature = newSignature;
      }
      // HERE WRITE
      const data = JSON.stringify(newGaugingData);
      const hash = ethers.utils.id(data);
      try {
        await writeData(props.currAddress, props.orderData.address, data);
      } catch (error) {
        console.log(error)
      }
      const transportationOrder = new ethers.Contract(props.orderData.address, TransportationOrder.abi, props.currSigner);
      const firstMeasurement = newGaugingData.originFull.operatorSignature === null ? true : false;
      const transaction = await transportationOrder.signOriginGauge(hash, firstMeasurement);
      await transaction.wait();
      await delay(2000);
    } else if (currentDialogType === dialogType.SIGN_GAUGE_DESTINATION && action === "sign") {
      
      if (newGaugingData.destinationFull.operatorSignature === null) {
        const newSignature = await props.currSigner.signMessage(JSON.stringify(newGaugingData.destinationFull.reading));
        newGaugingData.destinationFull.operatorSignature = newSignature;

      } else {
        const newSignature = await props.currSigner.signMessage(JSON.stringify(newGaugingData.destinationEmpty.reading));
        newGaugingData.destinationEmpty.operatorSignature = newSignature;
      }
      // HERE WRITE
      const data = JSON.stringify(newGaugingData);
      const hash = ethers.utils.id(data);
      await writeData(props.currAddress, props.orderData.address, data);
      
      const transportationOrder = new ethers.Contract(props.orderData.address, TransportationOrder.abi, props.currSigner);
      const thirdMeasurement = newGaugingData.destinationEmpty.operatorSignature === null ? true : false;
      const transaction = await transportationOrder.signDestinationGauge(hash, thirdMeasurement);
      await transaction.wait();
      await delay(2000);
    } else if (action === "sign" && (currentDialogType === dialogType.GENERATE_REPORT_ORIGIN || 
        currentDialogType === dialogType.SIGN_REPORT_ORIGIN ||
        currentDialogType === dialogType.GENERATE_REPORT_DESTINATION || 
        currentDialogType === dialogType.SIGN_REPORT_DESTINATION)) {
      
      let report;
      if (currentDialogType === dialogType.GENERATE_REPORT_ORIGIN || currentDialogType === dialogType.SIGN_REPORT_ORIGIN) {
        report = JSON.parse(JSON.stringify(inspectionOriginReport));
      } else {
        report = JSON.parse(JSON.stringify(inspectionDestinationReport));
      }

      const newSignature = await props.currSigner.signMessage(JSON.stringify(report.details));

      if (currentDialogType === dialogType.GENERATE_REPORT_ORIGIN || currentDialogType === dialogType.GENERATE_REPORT_DESTINATION) {
        report.inspectorSignature = newSignature;
      } else {
        report.operatorSignature = newSignature;
      }
      // HERE WRITE
      const data = JSON.stringify(report);
      const hash = ethers.utils.id(data);
      await writeData(props.currAddress, props.orderData.address, data);
      
      const transportationOrder = new ethers.Contract(props.orderData.address, TransportationOrder.abi, props.currSigner);
      let transaction; 
      if (currentDialogType === dialogType.GENERATE_REPORT_ORIGIN) {
        transaction = await transportationOrder.registerOriginInspectionReport(hash);
      } else if (currentDialogType === dialogType.SIGN_REPORT_ORIGIN){
        transaction = await transportationOrder.signOriginInspectionReport(hash);
      } else if (currentDialogType === dialogType.GENERATE_REPORT_DESTINATION) {
        transaction = await transportationOrder.registerDestinationInspectionReport(hash);
      } else {
        transaction = await transportationOrder.signDestinationInspectionReport(hash);
      } 
      await transaction.wait();
      await delay(2000);
    }
    setLoadingDialog(false);
    setOpen(false);
    props.setReload(props.orderData.address);
    
  };
 

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
    setRole(getRoleFromAddr(props.currAddress));
    
  }, [props.currAddress]);

  useEffect(() => {
    setButtonDetails({
      originGauge: getGaugingOriginButtonText(role, props.orderData.orderState),
      destinationGauge: getGaugingDestinationButtonText(role, props.orderData.orderState),
      inspectionOrigin: getInspectionOriginButtonText(role, props.orderData.orderState),
      inspectionDestination: getInspectionDestinationButtonText(role, props.orderData.orderState)
    });
  }, [role, props.orderData.orderState]);

  useEffect(() => {
    const loggerContract = new ethers.Contract(LOGGER_ADDR, TransportationOrderLogger.abi, props.currSigner);
    setLogger(loggerContract);
  }, [props.currSigner]);
  
  const requestGauge = async () => {
    setLoading(true);
    const orderContract = new ethers.Contract(props.orderData.address, TransportationOrder.abi, props.currSigner);
    const transaction = await orderContract.requestGauging();
    await transaction.wait();
    const state = props.orderData.orderState;
    if (state === orderState.ASSIGNED || state === orderState.REPORT_ORIGIN_SIGNED) {
      await logger.once('OriginEmptyGaugeRegistered', async (orderAddr) => action(orderAddr));
    } else if (state === orderState.LOADED) {
      await logger.once('OriginFullGaugeRegistered', async (orderAddr) => action(orderAddr));
    } else if (state === orderState.IN_TRANSIT || state === orderState.REPORT_DESTINATION_SIGNED) {
      await logger.once('DestinationFullGaugeRegistered', async (orderAddr) => action(orderAddr));
    } else if (state === orderState.UNLOADED) {
      await logger.once('DestinationEmptyGaugeRegistered', async (orderAddr) => action(orderAddr));
    }
  }

  const action = async (orderAddr) => {
    if (orderAddr === props.orderData.address) {
      await delay(2000);
      setLoading(false);
      props.setReload(orderAddr);
    }
  }
  const handleExpandClick = () => {
    if (expanded) {
      props.setFocusedAddr('');
    } else {
      props.setFocusedAddr(props.orderData.address);
    }
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
                cargoDetailsOrigin={props.orderData.cargoDetailsOrigin}
                cargoDetailsDestination={props.orderData.cargoDetailsDestination}
              />
              </Grid>  
              <Divider variant="middle" />
              <Grid container style={{paddingBottom: 10, paddingTop: 35}}>
              <GaugingSection 
                originGauge={buttonDetails.originGauge}
                destinationGauge={buttonDetails.destinationGauge}
                handleClick={handleClick}
                setCurrentDialogType={setCurrentDialogType}
                requestGauge={requestGauge}
                loading={loading}
                originRequestGauge={role === OPERATOR && 
                  (props.orderData.orderState === orderState.ASSIGNED || 
                    props.orderData.orderState === orderState.REPORT_ORIGIN_SIGNED ||
                    props.orderData.orderState === orderState.LOADED)}

                destinationRequestGauge={role === OPERATOR && 
                  (props.orderData.orderState === orderState.IN_TRANSIT || 
                    props.orderData.orderState === orderState.REPORT_DESTINATION_SIGNED ||
                    props.orderData.orderState === orderState.UNLOADED)}
              />
              </Grid>  
              <Divider variant="middle" />
              {role === OPERATOR &&
                (
                <Grid container xs={12} style={{marginTop: 30, marginBottom: 10}}>
                  <Button
                    onClick={handleCancelOrder}
                    aria-expanded={expanded}
                    aria-label="show more"
                    color="secondary"
                    variant="outlined"
                    style={{marginRight: 40}}  
                  >
                    Cancel Order
                  </Button>
                  <Alert severity="info" variant="outlined">Canceling the transportation order will return the ethers (Ξ) in escrow to the client.</Alert>
                  
              
                </Grid>)
              }   
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
          gaugingDetails={gaugingDetails}
          inspectionOriginReport={inspectionOriginReport}
          inspectionDestinationReport={inspectionDestinationReport}
          setInspectionOriginReport={setInspectionOriginReport}
          setInspectionDestinationReport={setInspectionDestinationReport}
          loadingDialog={loadingDialog}
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