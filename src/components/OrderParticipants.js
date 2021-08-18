import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import PeopleAltRoundedIcon from '@material-ui/icons/PeopleAltRounded';
import { DESTINATION_INSPECTOR, GAUGER, OPERATOR, ORIGIN_INSPECTOR, ADDR_ZERO } from '../helper';

const useStyles = makeStyles({
  container: {
    marginTop: 4,
  },
  textContainer: {
    marginTop: -3,
    paddingLeft: 5
  },
});

export default function OrderPaticipants(props) {

  const classes = useStyles();
  
  return(
    <Grid container spacing={3} className={classes.container}>
      <Grid container item xs={12}>
        <Grid item >
          <PeopleAltRoundedIcon />
        </Grid>
        <Grid item className={classes.textContainer}>
          <Typography variant="h6" component="h6">
            Order participants
          </Typography>
        </Grid> 
      </Grid>
      <Grid item xs={12}>
        <Typography color={props.role === OPERATOR ? "secondary" : ""}>
            Operator: {props.operator === ADDR_ZERO ? ' Not assigned' : <b>{props.operator}</b>}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={props.role === GAUGER ? "secondary" : ""}>
            Gauging sensor:{props.gaugingSensor === ADDR_ZERO ? ' Not assigned' : <b>{props.gaugingSensor}</b>}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={props.role === ORIGIN_INSPECTOR ? "secondary" : ""}>
            Origin inspector: {props.cargoInspectorOrigin === ADDR_ZERO ? ' Not assigned' : <b>{props.cargoInspectorOrigin}</b>}
        </Typography>
      </Grid>
      <Grid item xs={12}>
      <Typography color={props.role === DESTINATION_INSPECTOR ? "secondary" : ""}>
            Destination inspector: {props.cargoInspectorDestination === ADDR_ZERO ? ' Not assigned' : <b>{props.cargoInspectorDestination}</b>}
        </Typography>
      </Grid>
    </Grid>
  );
}
