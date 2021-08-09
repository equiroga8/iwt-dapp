import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { InputLabel, MenuItem, FormControl, Select, Paper, Grid, TextField, InputAdornment, Button, Typography, CircularProgress } from '@material-ui/core';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import TransportationOrderFactory from '../artifacts/contracts/TransportationOrderFactory.sol/TransportationOrderFactory.json';
import TransportationOrderLogger from '../artifacts/contracts/TransportationOrderLogger.sol/TransportationOrderLogger.json';
import { ethers } from 'ethers';
import { WEI_VAL, codeToPort, DEC_PLACES_REGEX, FACT_ADDR,LOGGER_ADDR } from '../helper';
import Alert from '@material-ui/lab/Alert';
import { createTable } from '../ddbMethods';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    paddingTop: 10,
    paddingBottom: 16,
    width: '100%'
  },
  formControlLoading: {
    margin: theme.spacing(1),
    paddingTop: 10,
    paddingBottom: 16,
    width: '100%', 
    opacity: 0.5
  },
  inputWrapper: {
    width: '90%',
  },
  input: {
    width: '100%',
  },
  title: {
    width: '90%',
    marginLeft: 10,
    marginTop: 10,
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));



export default function OrderForm() {

  const [originPort, setOriginPort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [payout, setPayout] = useState(undefined);
  const [deadline, setDeadline] = useState(new Date((new Date()).getTime() + (10 * 86400000)));
  const [cargoType, setCargoType] = useState('');
  const [cargoLoad, setCargoLoad] = useState();

  const [factoryContract, setFactoryContract] = useState();
  const [gasPrice, setGasPrice] = useState();
  const [loggerContract, setLoggerContract] = useState();
  const [signerAddr, setSignerAddr] = useState();

  const [status, setStatus] = useState();
  const [loading, setLoading] = useState(false);
  

  const classes = useStyles();

  useEffect(() => {
    const requestAccount = async () => {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const currentGasPrice = await provider.getGasPrice();
      const signer = provider.getSigner();
      setSignerAddr(await signer.getAddress());
      const factContract = new ethers.Contract(FACT_ADDR, TransportationOrderFactory.abi, signer);
      let estimatedGasPrice = await factContract.estimateGas.createTransportOrder(
        ethers.utils.hexlify([1, 2, 3, 4, 5]),
        ethers.utils.hexlify([1, 2, 3, 4, 5]),
        111111111,
        0,
        20,
        {value: '0' }
      );
      setFactoryContract(factContract);
      setGasPrice(estimatedGasPrice * currentGasPrice / WEI_VAL);
      setLoggerContract(new ethers.Contract(LOGGER_ADDR, TransportationOrderLogger.abi, signer))
    }
    requestAccount();
    
  },[]);

  const handleDateChange = (date) => {
    setDeadline(date);
  };

  const resetState = () => {
    setOriginPort('');
    setDestinationPort('');
    setPayout(undefined);
    setDeadline(new Date((new Date()).getTime() + (10 * 86400000)));
    setCargoType('');
    setCargoLoad();
  };
  

  const submitOrder = async () => {
    let value = payout * WEI_VAL;
    setLoading(true);
    try {
      
      const transaction = await factoryContract
      .createTransportOrder(
        ethers.utils.hexlify(originPort.split('').map ((c) => c.charCodeAt (0))),
        ethers.utils.hexlify(destinationPort.split('').map ((c) => c.charCodeAt (0))),
        deadline.getTime(),
        cargoType,
        Math.round(cargoLoad * 100),
        {value: value.toString() }
      );
      await transaction.wait();
      await loggerContract.once('OrderVerificationResult', async (orderAddr, clientDID, success) => {
        console.log(`OrderVerificationResult: ${success} for order ${orderAddr} with client ${clientDID}`);
        if (clientDID === signerAddr) {
          if (success) {
            await createTable(orderAddr);
            setStatus({error: false, msg: 'Your order has been succesfully created'});
            console.log("Table created");
          } else {
            setStatus({error: true, msg: "This address cannot be found in the DIDM system"});
            console.log()
          }
          setLoading(false);
        }
      });
    resetState();
    } catch (error) {
      setStatus({error: true, msg: error.message});
      setLoading(false);
    }
    
  }

  return (
    <Grid container item xs={12} sm={8} md={5} lg={4} xl={3}>
    <Paper className={loading ? classes.formControlLoading : classes.formControl} variant='outlined' elevation={3}>
    <Grid 
      container
      item
      spacing={3}
      direction="column"
      justifyContent="space-around"
      alignItems="center"
    >
      <Grid item className={classes.title}>
        <Typography variant="h5" component="h2" noWrap>
          Create a new transportation order
        </Typography>
      </Grid>
      <Grid item className={classes.inputWrapper}>
        <FormControl className={classes.input}>
          <InputLabel id="origin-port-select-label">Origin port</InputLabel>
          <Select
            key="origin-port-select"
            labelId="origin-port-select-label"
            id="origin-port-select"
            value={originPort}
            onChange={ e => setOriginPort(e.target.value)}
            disabled={loading}
          >
            {[...codeToPort.keys()].map((portCode, index) => 
              <MenuItem key={index} value={portCode}>{codeToPort.get(portCode)}</MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>
      <Grid item className={classes.inputWrapper}> 
        <FormControl className={classes.input}>
          <InputLabel id="destination-port-select-label">Destination port</InputLabel>
          <Select
            labelId="destination-port-select-label"
            id="destination-port-select"
            value={destinationPort}
            onChange={ e => setDestinationPort(e.target.value)}
            disabled={loading}
          >
            {[...codeToPort.keys()].map((portCode, index) => 
              <MenuItem key={index} value={portCode}>{codeToPort.get(portCode)}</MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>
      <Grid item className={classes.inputWrapper}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Grid container>
            <KeyboardDatePicker
              className={classes.input}
              disableToolbar
              disablePast
              variant="inline"
              format="dd/MM/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Order deadline"
              value={deadline}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
              disabled={loading}
            />
          </Grid>
        </MuiPickersUtilsProvider>
      </Grid>
      <Grid item className={classes.inputWrapper}>
        <FormControl className={classes.input}>
          <InputLabel id="cargo-type-select-label">Cargo type</InputLabel>
          <Select
            labelId="cargo-type-select-label"
            id="cargo-type-select"
            value={cargoType}
            onChange={ e => setCargoType(e.target.value)}
            disabled={loading}
          >
            <MenuItem value={0}>Bulk</MenuItem>
            <MenuItem value={1}>Piece</MenuItem>
            <MenuItem value={2}>Hazardous</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item className={classes.inputWrapper}>
        <TextField
            className={classes.input}
            id="outlined-number"
            label={`Cargo load ${ cargoType !== '' ? `(${cargoType === 1 ? 'TEU' : 'Tonnes' })` : ''} `}
            type="number"
            value={cargoLoad}
            onChange={ e => {
              if(DEC_PLACES_REGEX.test(e.target.value)) setCargoLoad(e.target.value)
            }}
            disabled={cargoType === '' || loading}
            error={cargoLoad <= 0}
            helperText={cargoLoad <= 0 ? 'Cargo load must be bigger than 0' : ' '}
          />
      </Grid>
      <Grid item className={classes.inputWrapper}>
        <TextField
            className={classes.input}
            id="outlined-number"
            label="Order payout (Ether Ξ)"
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalAtmIcon />
                </InputAdornment>
              ),
            }}
            value={payout}
            onChange={ e => setPayout(e.target.value) }
            error={payout <= 0}
            helperText={payout <= 0 ? 'Payout must be bigger than 0' : ' '}
            disabled={loading}
          />
      </Grid>
      <Grid item className={classes.inputWrapper}>
        <Alert severity="info">{`The estimated gas price for this transaction is ${Math.round(gasPrice*10000)/10000} Ξ`}</Alert>
      </Grid>
      { status &&
        <Grid item className={classes.inputWrapper}>
          <Alert severity={status && status.error ? "error" : "success"} variant="outlined">
            {status.msg}
          </Alert>
        </Grid>
      }
      <Grid  
        item
        container
        direction='row-reverse'
        className={classes.inputWrapper}
      >
        <Grid item>        
          <label htmlFor="create-button">
            <Button 
              variant="contained" 
              color="primary"
              onClick={submitOrder}
              disabled={loading || !(originPort !== '' && destinationPort !== '' && payout > 0 && cargoType !== '' && cargoLoad > 0)}
            >
              Create order
            </Button>
            {loading && 
                <CircularProgress size={24} className={classes.buttonProgress} />
            }
          </label>
        </Grid>
      </Grid>
      
    </Grid>
    </Paper>
    </Grid>
  );
}
