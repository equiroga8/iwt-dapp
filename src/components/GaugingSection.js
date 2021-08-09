import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Button } from '@material-ui/core';
import FiberManualRecordOutlinedIcon from '@material-ui/icons/FiberManualRecordOutlined';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import OpacityIcon from '@material-ui/icons/Opacity';

const useStyles = makeStyles({
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
});

export default function GaugingSection(props) {

  const classes = useStyles();
  const handleButtonClick = (dialogType) => {
    console.log("Click Clack");
    props.setCurrentDialogType(dialogType);
    props.handleClick()
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
