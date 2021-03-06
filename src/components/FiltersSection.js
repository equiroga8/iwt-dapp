import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, FormControl, InputLabel, Select, MenuItem, Slider, Button } from '@material-ui/core';
import { codeToPort, DESTINATION_INSPECTOR, OPERATOR, ORIGIN_INSPECTOR } from '../helper';
import FilterListRoundedIcon from '@material-ui/icons/FilterListRounded';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';

const useStyles = makeStyles({
    container:{
      marginLeft: 15,
    },
    textContainer: {
        paddingTop: 2,
      },
    title: {
        marginLeft: 0,
    },
    inputWrapper: {
      width: '50%',
    },
    input: {
      width: '90%',
    },

});

const valuetext = (value) => {
    return `${value}Ξ`;
  }



export default function FiltersSection(props) {



  const filter = () => {
    props.setRole(filterRole);
    props.filterOrders({
      role: filterRole,
      originPort,
      destinationPort,
      startDate,
      endDate,
      payoutRange
    });
  }

  const reset = () => {

    props.filterOrders({
      role: OPERATOR,
      originPort: '',
      destinationPort: '',
      startDate: null,
      endDate: null,
      payoutRange: [props.minPayout, props.maxPayout]
    });

    props.setRole(OPERATOR);
    setFilterRole(OPERATOR);
    setOriginPort('');
    setDestinationPort('')
    setStartDate(null);
    setEndDate(null);
    setPayoutRange([props.minPayout, props.maxPayout]);
  }

  const classes = useStyles();
  
  const [filterRole, setFilterRole] = useState(OPERATOR);
  const [originPort, setOriginPort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [payoutRange, setPayoutRange] = useState([props.minPayout, props.maxPayout]);
  
  return (
    <Grid container spacing={3} className={classes.container}>
        <Grid 
          item 
          container 
          xs={12} 
          className={classes.title} 
          direction="row"
          alignItems="center"
        >
            <Grid item>
              <Typography variant="h6" component="h6">
                  Filters
              </Typography>
            </Grid>
        </Grid>
        <Grid item xs={12} className={classes.inputWrapper}>
            <FormControl className={classes.input}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                    key="role-select"
                    labelId="role-select-label"
                    id="role-select"
                    value={filterRole}
                    onChange={ e => setFilterRole(e.target.value)}
                >   
                    <MenuItem value={OPERATOR}>Operator</MenuItem>
                    <MenuItem value={ORIGIN_INSPECTOR}>Origin port inspector</MenuItem>
                    <MenuItem value={DESTINATION_INSPECTOR}>Destination port inspector</MenuItem>    
                </Select>
            </FormControl>
        </Grid>
        <Grid item xs={12} className={classes.inputWrapper}>
            <FormControl className={classes.input}>
            <InputLabel id="origin-port-select-label">Origin port</InputLabel>
            <Select
                key="origin-port-select"
                labelId="origin-port-select-label"
                id="origin-port-select"
                value={originPort}
                onChange={ e => setOriginPort(e.target.value)}
            >
                <MenuItem value=''>
                  <em>None</em>
                </MenuItem>
                {[...codeToPort.keys()].map((portCode, index) => 
                <MenuItem key={index} value={portCode}>{codeToPort.get(portCode)}</MenuItem>
                )}
            </Select>
            </FormControl>
        </Grid>
        <Grid item xs={12} className={classes.inputWrapper}>
            <FormControl className={classes.input}>
            <InputLabel id="destination-port-select-label">Destination port</InputLabel>
            <Select
                labelId="destination-port-select-label"
                id="destination-port-select"
                value={destinationPort}
                onChange={ e => setDestinationPort(e.target.value)}
            >
                <MenuItem value=''>
                  <em>None</em>
                </MenuItem>
                {[...codeToPort.keys()].map((portCode, index) => 
                <MenuItem key={index} value={portCode}>{codeToPort.get(portCode)}</MenuItem>
                )}
            </Select>
            </FormControl>
        </Grid>
        <Grid item xs={12} className={classes.inputWrapper}>
            <Typography id="range-slider" gutterBottom>
                Payout range
            </Typography>
            <Slider
                className={classes.input}
                value={payoutRange}
                onChange={(event, newValue) => setPayoutRange(newValue)}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                getAriaValueText={valuetext}
                max={props.maxPayout}
                min={props.minPayout}
            />
        </Grid>

        <Grid item xs={12} className={classes.inputWrapper}>
            <Typography id="range-slider" gutterBottom>
                Deadline range
            </Typography>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid container>
                    <KeyboardDatePicker
                    className={classes.input}
                    disableToolbar
                    disablePast
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="start-date-picker-inline"
                    label="Start"
                    value={startDate}
                    onChange={(date) => setStartDate(date.getTime())}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                    />
                </Grid>
            </MuiPickersUtilsProvider>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid container>
                    <KeyboardDatePicker
                    className={classes.input}
                    disableToolbar
                    disablePast
                    variant="inline"
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="end-date-picker-inline"
                    label="End"
                    value={endDate}
                    onChange={(date) => setEndDate(date.getTime())}
                    KeyboardButtonProps={{
                        'aria-label': 'change date',
                    }}
                    />
                </Grid>
            </MuiPickersUtilsProvider>
        </Grid>
        <Grid item container xs={12}
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          style={{marginLeft: -10}}
        >
              <Button 
                variant="outlined"
                size="small" 
                color="primary"
                onClick={reset}
                startIcon={<RotateLeftIcon />}
              >
                Reset
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                size="small"
                onClick={filter}
                startIcon={<FilterListRoundedIcon />}
              >
                Apply
              </Button>
        </Grid>
    </Grid>
  );
}

