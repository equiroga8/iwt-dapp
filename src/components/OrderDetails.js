import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Chip, Avatar } from '@material-ui/core';
import { hexToDate, cargoTypes, orderStateMap } from '../helper';
import CategoryIcon from '@material-ui/icons/Category';
import EventIcon from '@material-ui/icons/Event';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import DataUsageIcon from '@material-ui/icons/DataUsage';

import IconTitle from './IconTitle';

const useStyles = makeStyles({
  container: {
    marginTop: 4,
  },
});

export default function OrderDetails(props) {

  const classes = useStyles();
  
  return(
    <Grid container spacing={3} className={classes.container}>
      <Grid item xs={6}>
       <Typography variant="h6" component="h6">
          Transportation order details
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Chip 
          variant="outlined" 
          //style={{ color: props.orderState === 0 ? 'blue': 'red' }} 
          avatar={<Avatar>{props.orderState}</Avatar>} 
          label={orderStateMap.get(props.orderState)}
        />
      </Grid>
      <Grid item xs={12}>
        <IconTitle icon={<AssignmentIndIcon />} text={"Client: "} bold={props.client}/>
      </Grid>
      <Grid item xs={12}>
        <IconTitle icon={<EventIcon />} text={"Deadline: "} bold={hexToDate(props.deadline._hex)}/>
      </Grid>
      <Grid item xs={12}>
        <IconTitle icon={<CategoryIcon />} text={"Cargo type: "} bold={cargoTypes.get(props.cargoType)}/>
      </Grid>
      <Grid item xs={12}>
        <IconTitle icon={<DataUsageIcon />} text={"Cargo load: "} bold={props.cargoLoad + ` ${cargoTypes.get(props.cargoType) === 'Piece' ? 'TEU' : 'Tonnes'}`}/>
      </Grid>
    </Grid>
  );
}
