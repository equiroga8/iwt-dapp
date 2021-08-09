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
import OrdersList from './components/OrdersList';
import { Grid } from '@material-ui/core';
import OrderCardExtra from './components/OrderCardExtra';
import OrderDialog from './components/OrderDialog';

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
              <OrdersList />
            </Route>
            <Route path="/my-orders">
              <OrderCardExtra />
            </Route>
            <Route path="/sign-data">
              <OrderDialog />
            </Route>
          </Switch>
        </Grid>  
      </Grid>
    </Router>
  );
}

