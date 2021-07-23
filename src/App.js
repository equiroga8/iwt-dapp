import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import OrderForm from './components/OrderForm';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DirectionsBoatTwoToneIcon from '@material-ui/icons/DirectionsBoatTwoTone';
import TabPanel from './components/TabPanel';
import AvailableOrdersList from './components/AvailableOrdersList';
import IconTitle from './components/IconTitle';
import { Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  content: {
    marginTop: 50,
    display: 'flex',
    justifyContent: "center"
  }
}));

export default function App() {

  const classes = useStyles();

  return (
    <Router>
      <Grid container>
        <Grid item xs={12} className={classes.root}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <IconButton 
              edge="start" 
              className={classes.icon} 
              color="inherit" 
              aria-label="icon"
              disableFocusRipple
              disableRipple
            >
              <DirectionsBoatTwoToneIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              IWT support app
            </Typography>
          </Toolbar>
        </AppBar>
        <TabPanel/>
      </Grid>
        <Grid item xs={12} className={classes.content}>
          <Switch>
            <Route path="/create">
              <OrderForm />
            </Route>
            <Route path="/orders">
              <AvailableOrdersList />
            </Route>
            <Route path="/myorders">
              <IconTitle />
            </Route>
          </Switch>
        </Grid>  
      </Grid>
    </Router>
  );
}

