import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';


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

export default function IconTitle(props) {

  const classes = useStyles();
  

  return (
    <Grid container spacing={0}>
        <Grid item>
            {props.icon}
        </Grid>
        <Grid item>
            <Typography>
                {props.text}
            </Typography>
        </Grid>
    </Grid>
  );
}