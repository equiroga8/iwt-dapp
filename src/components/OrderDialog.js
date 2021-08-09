import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import { dialogTypeTitle } from '../helper';
import { Grid, Typography } from '@material-ui/core';
import GaugeDetails from './dialogContent/GaugeDetails';
import ReportDetails from './dialogContent/ReportDetails';
import ReportGeneration from './dialogContent/ReportGeneration';



export default function OrderDialog(props) {
  const { onClose, value: valueProp, open, dialogType, ...other } = props;
  const [value, setValue] = useState(valueProp);
  

  useEffect(() => {
    if (!open) {
      setValue(valueProp);
    }
  }, [valueProp, open]);

 

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(value);
  };

  

  return (
    <Dialog
      maxWidth="md"
      aria-labelledby="confirmation-dialog-title"
      open={open}
      {...other}
    >
      <DialogTitle id="confirmation-dialog-title" variant="h5">
        <Typography gutterBottom variant="h5" component="h2">
          {dialogTypeTitle.get(dialogType)}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
      {
        (dialogType === 0 || dialogType === 1 || dialogType === 5 || dialogType === 6) &&
        <GaugeDetails/>
      }
      {
        (dialogType === 3 || dialogType === 4 || dialogType === 8 || dialogType === 9) &&
        <ReportDetails/>
      }
      {
        (dialogType === 2 || dialogType === 7) &&
        <ReportGeneration/>
      }
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary">
          Close
        </Button>
        {
          (dialogType === 1 || dialogType === 3 || dialogType === 6 || dialogType === 8) &&
          <Button onClick={handleOk} color="primary">
            Sign
          </Button>
        }
        {
          (dialogType === 2 || dialogType === 7) &&
          <Button onClick={handleOk} color="primary">
            Submit
          </Button>
        }
      </DialogActions>
    </Dialog>
  );
}

Dialog.defaultProps = {
  
}

OrderDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
};

