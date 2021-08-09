import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Button } from '@material-ui/core';
import FiberManualRecordOutlinedIcon from '@material-ui/icons/FiberManualRecordOutlined';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import SearchIcon from '@material-ui/icons/Search';

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

export default function InspectionSection(props) {

  const classes = useStyles();

  const handleButtonClick = (dialogType) => {
    props.setCurrentDialogType(dialogType);
    props.handleClick()
  }
  
  return(
    <Grid container spacing={3} className={classes.container}>
      <Grid container item xs={12}>
        <Grid item >
          <SearchIcon />
        </Grid>
        <Grid item className={classes.titleContainer}>
          <Typography variant="h5" component="h5">
            Inspection details
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
          disabled={props.inspectionOrigin.disabled}
          onClick={(e) => handleButtonClick(props.inspectionOrigin.dialogType)}  
        > 
          {props.inspectionOrigin.text}
        </Button>
        </Grid>
      </Grid> 
      <Grid container item xs={6}>
        <Grid item >
         <Button 
          variant="outlined" 
          disabled={props.inspectionDestination.disabled}
          onClick={(e) => handleButtonClick(props.inspectionDestination.dialogType)}
          > 
          {props.inspectionDestination.text}
          </Button>
        </Grid>
      </Grid> 
    </Grid>
  );
}
