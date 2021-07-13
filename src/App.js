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

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function App() {

  const classes = useStyles();

  return (
    <Router>
      <div>
        <div className={classes.root}>
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
      </div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/create">
            <OrderForm />
          </Route>
          <Route path="/orders">
            <AvailableOrdersList />
          </Route>
          <Route path="/myorders">
            <MyOrders />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function MyOrders() {
  return <h2>My Orders</h2>;
}