import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import { dialogTypeTitle, INSP_DETAILS_TEMPL } from '../helper';
import {  Typography, CircularProgress } from '@material-ui/core';
import GaugeDetails from './dialogContent/GaugeDetails';
import ReportDetails from './dialogContent/ReportDetails';
import ReportGeneration from './dialogContent/ReportGeneration';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -14,
    marginLeft: -12  },
}));

export default function OrderDialog(props) {
  const { onClose, open, dialogType, inspectionOriginReport, inspectionDestinationReport, setInspectionDestinationReport, setInspectionOriginReport, loadingDialog, ...other } = props; 

  const handleCancel = () => {
    if (dialogType === 2 || dialogType === 7) {
      console.log("Closing shop");
      setInspectionOriginReport(INSP_DETAILS_TEMPL);
      setInspectionDestinationReport(INSP_DETAILS_TEMPL)
    }
    onClose("cancel");
  };

  const handleOk = (action) => {
 
    onClose(action);
  };

  const getIfDisabled = () => {
    let disabled = false;
    if (dialogType === 2) {
      disabled = inspectionOriginReport.details.holds.length === 0 || inspectionOriginReport.details.bargeDID === null;
    } else {
      disabled = inspectionDestinationReport.details.holds.length === 0 || inspectionDestinationReport.details.bargeDID === null;

    }
    return disabled
  };

  const classes = useStyles();
  
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
        <GaugeDetails 
          originEmpty={props.gaugingDetails.originEmpty}
          originFull={props.gaugingDetails.originFull}
          destinationEmpty={props.gaugingDetails.destinationEmpty}
          destinationFull={props.gaugingDetails.destinationFull}
          dialogType={dialogType}
        />
      }
      {
        (dialogType === 3 || dialogType === 4 || dialogType === 8 || dialogType === 9) &&
        <ReportDetails
          inspectionDestinationReport={inspectionDestinationReport}
          inspectionOriginReport={inspectionOriginReport}
          dialogType={dialogType}
        />
      }
      {
        (dialogType === 2 || dialogType === 7) &&
        <ReportGeneration
          inspectionDestinationReport={inspectionDestinationReport}
          inspectionOriginReport={inspectionOriginReport}
          setInspectionOriginReport={setInspectionOriginReport}
          setInspectionDestinationReport={setInspectionDestinationReport}
          dialogType={dialogType}
        />
      }
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary" disabled={loadingDialog}>
          Close
        </Button>
        {
          (dialogType === 1 || dialogType === 3 || dialogType === 6 || dialogType === 8) &&
          <div className={classes.wrapper}>
            <Button onClick={e => handleOk("sign")} color="primary" disabled={loadingDialog}>
              Sign
            </Button>
            {loadingDialog && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
        }
        {
          (dialogType === 2 || dialogType === 7) &&
          <div className={classes.wrapper}>
            <Button onClick={e => handleOk("sign")} color="primary" disabled={loadingDialog || getIfDisabled()}>
              {"Sign & submit"}
            </Button>
            {loadingDialog && <CircularProgress size={24} className={classes.buttonProgress} />}
          </div>
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

