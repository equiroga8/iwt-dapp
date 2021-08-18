import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Button, CircularProgress } from '@material-ui/core';
import FiberManualRecordOutlinedIcon from '@material-ui/icons/FiberManualRecordOutlined';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import OpacityIcon from '@material-ui/icons/Opacity';

const useStyles = makeStyles((theme) => ({
  container: {
    marginBottom: 5
  },
  textContainer: {
    marginTop: -3,
    paddingLeft: 5
  },
  titleContainer: {
    marginTop: -3,
    paddingLeft: 5
  },
  wrapper: {
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -14,
    marginLeft: 0  },
}));

export default function GaugingSection(props) {

  const classes = useStyles();
  const handleButtonClick = (dialogType) => {

    props.setCurrentDialogType(dialogType);
    props.handleClick(dialogType);
  }
  return(
    <Grid container spacing={3} className={classes.container}>
      <Grid container item xs={12}>
        <Grid item >
          <OpacityIcon />
        </Grid>
        <Grid item className={classes.titleContainer}>
          <Typography variant="h5" component="h5">
            Gauging details
          </Typography>
        </Grid>
      </Grid>
      <Grid container item xs={6}>
        <Grid item >
          <FiberManualRecordOutlinedIcon />
        </Grid>
        <Grid item className={classes.textContainer}>
          <Typography variant="h6" component="h6">
            Origin
          </Typography>
        </Grid>
          <div className={classes.wrapper}>
            <Button 
              variant="outlined" 
              size="small"
              style={{marginLeft: 30, marginTop: -2}}
              onClick={(e) => props.requestGauge()}
              disabled={!props.originRequestGauge || props.loading}
            > 
              Request gauge
            </Button>
            {props.loading && props.originRequestGauge && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div> 
      </Grid> 
      <Grid container item xs={6}>
        <Grid item >
          <LocationOnOutlinedIcon />
        </Grid>
        <Grid item className={classes.textContainer}>
          <Typography variant="h6" component="h6">
            Destination
          </Typography>
        </Grid>
        <div className={classes.wrapper}>
          <Button 
            variant="outlined" 
            size="small"
            style={{marginLeft: 30, marginTop: -2}}
            onClick={(e) => props.requestGauge()}
            disabled={!props.destinationRequestGauge || props.loading}
          > 
            Request gauge
          </Button>
          {props.loading && props.destinationRequestGauge && <CircularProgress size={24} className={classes.buttonProgress} />}
        </div> 
      </Grid> 
      <Grid container item xs={6}>
        <Grid item >
        <Button 
          variant="outlined" 
          disabled={props.originGauge.disabled} 
          onClick={(e) => handleButtonClick(props.originGauge.dialogType)}
        > 
          {props.originGauge.text}
        </Button>
        
        </Grid>
      </Grid> 
      <Grid container item xs={6}>
        <Grid item >
         <Button 
          variant="outlined" 
          disabled={props.destinationGauge.disabled}
          onClick={(e) => handleButtonClick(props.destinationGauge.dialogType)}
        > 
          {props.destinationGauge.text}
         </Button>
        </Grid>
      </Grid> 
    </Grid>
  );
}
