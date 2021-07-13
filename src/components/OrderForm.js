import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Button from '@material-ui/core/Button';
import TransportationOrderFactory from '../artifacts/contracts/TransportationOrderFactory.sol/TransportationOrderFactory.json';
import { ethers } from 'ethers';
import { WEI_VAL, codeToPort } from '../helper';

const FACT_ADDR = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 460,
  },
  inputWrapper: {
    width: '95%',
    marginLeft: 10,
  },
  input: {
    width: '100%',
  },
  test: {
    width: '100%',
    background: 'red',
  },
}));



export default function OrderForm() {

  const [originPort, setOriginPort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [payout, setPayout] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [cargoType, setCargoType] = useState('');
 

  const classes = useStyles();

  const handleDateChange = (date) => {
    setDeadline(date);
  };

  const requestAccount = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  const submitOrder = async () => {
    let value = payout * WEI_VAL;
    await requestAccount()
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(FACT_ADDR, TransportationOrderFactory.abi, signer);
    const transaction = await contract
      .createTransportOrder(
        ethers.utils.hexlify(originPort.split('').map ((c) => c.charCodeAt (0))),
        ethers.utils.hexlify(destinationPort.split('').map ((c) => c.charCodeAt (0))),
        deadline.getTime(),
        cargoType, 
        {value: value.toString() }
      );
    await transaction.wait();
  }

  return (
    <Paper className={classes.formControl} variant='outlined'>
    <Grid 
      container  
      spacing={2}
      direction="column"
      justifyContent="space-around"
      alignItems="flex-start"
    >
      <h1>Create a new transportaion order</h1>
      <Grid item className={classes.inputWrapper}>
        <FormControl className={classes.input}>
          <InputLabel id="origin-port-select-label">Origin port</InputLabel>
          <Select
            key="origin-port-select"
            labelId="origin-port-select-label"
            id="origin-port-select"
            value={originPort}
            onChange={ e => setOriginPort(e.target.value)}
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
          >
            {[...codeToPort.keys()].map((portCode, index) => 
              <MenuItem key={index} value={portCode}>{codeToPort.get(portCode)}</MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>
      <Grid item className={classes.inputWrapper}>
        <FormControl className={classes.input}>
          <InputLabel id="cargo-type-select-label">Cargo type</InputLabel>
          <Select
            labelId="cargo-type-select-label"
            id="cargo-type-select"
            value={cargoType}
            onChange={ e => setCargoType(e.target.value)}
          >
            <MenuItem value={0}>Bulk</MenuItem>
            <MenuItem value={1}>Piece</MenuItem>
            <MenuItem value={2}>Hazardous</MenuItem>
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
            />
          </Grid>
        </MuiPickersUtilsProvider>
      </Grid>
      <Grid item className={classes.inputWrapper}>
        <TextField
            className={classes.input}
            id="outlined-number"
            label="Order payout"
            type="number"
            InputLabelProps={{
              shrink: true,
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
            value={payout}
            onChange={ e => setPayout(e.target.value) }
          />
      </Grid>
      <Grid  
        item
        container
        direction='row'
        justifyContent="flex-end"
        alignItems="center"
        className={classes.test}
      >
        <Grid item>
          <Button 
            variant="contained" 
            color="primary"
            onClick={submitOrder}
          >
            Create order
          </Button>
        </Grid>
      </Grid>
    </Grid>
    </Paper>
  );
}
