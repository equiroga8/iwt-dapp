import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import FilterListRoundedIcon from '@material-ui/icons/FilterListRounded';

const useStyles = makeStyles({
    textContainer: {
        paddingTop: 2,
        paddingLeft: 3
      },
    container: {
        marginLeft: 15,
    }
});

export default function FiltersSection(props) {

  const classes = useStyles();
  

  return (
    <Grid container spacing={0}>
        <Grid item container xs={12} className={classes.container}>
            <Grid item >
                <FilterListRoundedIcon fontSize="large"/>
            </Grid>
            <Grid item className={classes.textContainer}>
                <Typography variant="h6" component="h6">
                    Filters
                </Typography>
            </Grid>
        </Grid>
        <Grid item xs={12}>
            
        </Grid>
    </Grid>
  );
}

