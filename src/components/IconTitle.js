import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';


const useStyles = makeStyles({
  textContainer: {
    paddingTop: 1,
    paddingLeft: 3
  },
});

export default function IconTitle(props) {

  const classes = useStyles();
  

  return (
    <Grid container spacing={0}>
        <Grid item >
            {props.icon}
        </Grid>
        <Grid item className={classes.textContainer}>
            <Typography color={props.color}>
                {props.text} <b>{props.bold}</b>
            </Typography>
        </Grid>
    </Grid>
  );
}

IconTitle.defaultProps = {
  icon: <LocationOnOutlinedIcon/>,
  text: "Button Text",
  color: "textPrimary",
  bold: ""
};