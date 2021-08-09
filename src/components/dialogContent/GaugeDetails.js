import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';

const useStyles = makeStyles({
  textContainer: {
    paddingTop: 1,
    paddingLeft: 3
  },
});

export default function GaugeDetails(props) {

  const classes = useStyles();  

  return (
    <Grid spacing={0}>
      
        <Typography gutterBottom variant="h6" component="h2">
            Empty
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            <ul>
              <li>Measurement: 30</li>
              <li>Timestamp: </li>
              <li>Gauger signature: 0x1234</li>
            </ul>
          </Typography>
        
        
        <Typography gutterBottom variant="h6" component="h2">
            Full
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            <ul>
              <li>Measurement: 60</li>
              <li>Timestamp: Mon Aug 09 2021 18:47:24 GMT+0200 (Central European Summer Time)</li>
              <li>Gauger signature: 0x1234</li>
            </ul>
          </Typography>  
        <Typography gutterBottom variant="h6" component="h2">
            Result
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            <ul>
              <li>Difference: 30</li>
            </ul>
          </Typography>
        
    </Grid>
  );
}
