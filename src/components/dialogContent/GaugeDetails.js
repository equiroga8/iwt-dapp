import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import { dialogType } from '../../helper';

const useStyles = makeStyles({
  textContainer: {
    paddingTop: 1,
    paddingLeft: 3
  },
});

export default function GaugeDetails(props) {

  const { originEmpty, originFull, destinationEmpty, destinationFull, dialogType, ...other } = props;

  const classes = useStyles();  

  return (
    <Grid spacing={0}>
      
        <Typography gutterBottom variant="h6" component="h2">
            {(dialogType === 0 || dialogType === 1) ? "Empty" : "Full"}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
          {(dialogType === 0 || dialogType === 1) ? (
            <ul>
              <li>Measurement: {originEmpty.reading.measurement ? originEmpty.reading.measurement : "-"}</li>
              <li>Timestamp: {originEmpty.reading.timestamp ? originEmpty.reading.timestamp : "-"}</li>
              <li>Gauger signature: {originEmpty.gaugerSignature ? "Yes" : "-"}</li>
              <li>Operator signature: {originEmpty.operatorSignature ? "Yes" : "-"}</li>
          </ul>
          ) : (
            <ul>
              <li>Measurement: {destinationFull.reading.measurement ? destinationFull.reading.measurement : "-"}</li>
              <li>Timestamp: {destinationFull.reading.timestamp ? destinationFull.reading.timestamp : "-"}</li>
              <li>Gauger signature: {destinationFull.gaugerSignature ? "Yes" : "-"}</li>
              <li>Operator signature: {destinationFull.operatorSignature ? "Yes" : "-"}</li>
            </ul>
          )}
            
          </Typography>
        
        
        <Typography gutterBottom variant="h6" component="h2">
          {dialogType === 0 || dialogType === 1 ? "Full" : "Empty"}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
          {dialogType === 0 || dialogType === 1 ? (
            <ul>
              <li>Measurement: {originFull.reading.measurement ? originFull.reading.measurement : "-"}</li>
              <li>Timestamp: {originFull.reading.timestamp ? originFull.reading.timestamp : "-"}</li>
              <li>Gauger signature: {originFull.gaugerSignature ? "Yes" : "-"}</li>
              <li>Operator signature: {originFull.operatorSignature ? "Yes" : "-"}</li>
          </ul>
          ) : (
            <ul>
              <li>Measurement: {destinationEmpty.reading.measurement ? destinationEmpty.reading.measurement : "-"}</li>
              <li>Timestamp: {destinationEmpty.reading.timestamp ? destinationEmpty.reading.timestamp : "-"}</li>
              <li>Gauger signature: {destinationEmpty.gaugerSignature ? "Yes" : "-"}</li>
              <li>Operator signature: {destinationEmpty.operatorSignature ? "Yes" : "-"}</li>
            </ul>
          )}
          </Typography>  
        <Typography gutterBottom variant="h6" component="h2">
            Result
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            <ul>
              <li>Difference: 
                {dialogType === 0 || dialogType === 1 ? (
                  originFull.reading.measurement && originEmpty.reading.measurement ? 
                    " " + Math.abs(originFull.reading.measurement - originEmpty.reading.measurement) : " -")
                  : (
                    destinationFull.reading.measurement && destinationEmpty.reading.measurement ? 
                    " " + Math.abs(destinationFull.reading.measurement - destinationEmpty.reading.measurement) : " -"
                  )
                }
              </li>
            </ul>
          </Typography>
        
    </Grid>
  );
}

GaugeDetails.defaultProps = {
  gaugingDetails:{
    originEmpty: {
        reading: {
            measurement: null,
            timestamp: null
        },
        gaugerSignature: null,
        operatorSignature: null
    },
    originFull: {
        reading: {
            measurement: null,
            timestamp: null
        },
        gaugerSignature: null,
        operatorSignature: null
    },
    destinationFull: {
        reading: {
            measurement: null,
            timestamp: null
        },
        gaugerSignature: null,
        operatorSignature: null
    },
    destinationEmpty: {
        reading: {
            measurement: null,
            timestamp: null
        },
        gaugerSignature: null,
        operatorSignature: null
    }
  }
}