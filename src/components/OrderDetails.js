import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Chip, Avatar } from '@material-ui/core';
import { CLIENT, intToDate, orderStateMap } from '../helper';
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
          Order details
        </Typography>
      </Grid>
        <Grid item xs={6}>
          <Chip 
            variant="outlined" 
            avatar={<Avatar>{props.orderState}</Avatar>} 
            label={orderStateMap.get(props.orderState)}
          />
      </Grid>
      <Grid item xs={12}>
        <IconTitle icon={<AssignmentIndIcon />} color={props.role === CLIENT ? "secondary" : ""} text={"Client: "} bold={props.client}/>
      </Grid>
      <Grid item xs={12}>
        <IconTitle icon={<EventIcon />} text={"Deadline: "} bold={intToDate(props.deadline)}/>
      </Grid>
      <Grid item xs={12}>
        <IconTitle icon={<CategoryIcon />} text={"Cargo type: "} bold={props.cargoType}/>
      </Grid>
      <Grid item xs={12}>
        <IconTitle icon={<DataUsageIcon />} text={"Cargo load: "} bold={props.cargoLoad + ` ${props.cargoType === 'Piece' ? 'TEU' : 'Tonnes'}`}/>
      </Grid>
    </Grid>
  );
}
