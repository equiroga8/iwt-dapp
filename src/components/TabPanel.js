import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AddBoxRoundedIcon from '@material-ui/icons/AddBoxRounded';
import FormatListBulletedRoundedIcon from '@material-ui/icons/FormatListBulletedRounded';
import DescriptionRoundedIcon from '@material-ui/icons/DescriptionRounded';
import {
    Link
  } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  iconLabelWrapper: {
    flexDirection: "row",
  },
  labelContainer: {
    width: "auto",
    margin: 0,
  },
});

export default function CenteredTabs() {
  const classes = useStyles();
  const [value, setValue] = useState(0);

  const allTabs = ['/create', '/orders', '/myorders'];

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper className={classes.root}>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab 
            classes={{
              wrapper: classes.iconLabelWrapper,
              labelContainer: classes.labelContainer
            }} 
            label="New order" 
            icon={<AddBoxRoundedIcon style={{ display: "inline-block", marginBottom:"-1px", marginRight: "6px" }}/>}
            component={Link} to={allTabs[0]}
        />
        <Tab 
            classes={{
              wrapper: classes.iconLabelWrapper,
              labelContainer: classes.labelContainer
            }} 
            label="View available orders" 
            icon={<FormatListBulletedRoundedIcon style={{ display: "inline-block", marginBottom:"-1px", marginRight: "6px" }}/>}
            component={Link} to={allTabs[1]}
        />
        <Tab 
            classes={{
              wrapper: classes.iconLabelWrapper,
              labelContainer: classes.labelContainer
            }} 
            label="My orders" 
            icon={<DescriptionRoundedIcon style={{ display: "inline-block", marginBottom:"-1px", marginRight: "6px" }}/>}
            component={Link} to={allTabs[2]}
            disabled
        />
      </Tabs>
    </Paper>
  );
}