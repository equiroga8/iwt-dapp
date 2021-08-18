import { makeStyles } from '@material-ui/core/styles';
import { useEffect, useState } from 'react';
import { Grid, Checkbox, FormControlLabel, TextField, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@material-ui/core';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles({
  textContainer: {
    paddingTop: 1,
    paddingLeft: 3
  },
});

export default function ReportGeneration(props) {
  const { dialogType, inspectionOriginReport, inspectionDestinationReport, setInspectionDestinationReport, setInspectionOriginReport, loadingDialog, ...other } = props; 

  const classes = useStyles(); 
  
  
  const [cargoHoldDID, setCargoHoldDID] = useState('');
  const [isClean, setIsClean] = useState(false);
  const [addingRow, setAddingRow] = useState(false);

  const deleteRow = (index) => {
    
    if (dialogType === 2) {
      let newInspectionOriginReport = JSON.parse(JSON.stringify(inspectionOriginReport));
      newInspectionOriginReport.details.holds.splice(index, 1);
      setInspectionOriginReport(newInspectionOriginReport);
    } else {
      let newInspectionDestinationReport = JSON.parse(JSON.stringify(inspectionDestinationReport));
      newInspectionDestinationReport.details.holds.splice(index, 1);
      setInspectionDestinationReport(newInspectionDestinationReport);
    }
  };

  const addRow = () => {
    if (dialogType === 2) {
      let newInspectionOriginReport = JSON.parse(JSON.stringify(inspectionOriginReport));
      newInspectionOriginReport.details.holds.push({cargoHoldDID, isClean});
      setInspectionOriginReport(newInspectionOriginReport);
    } else {
      let newInspectionDestinationReport = JSON.parse(JSON.stringify(inspectionDestinationReport));
      newInspectionDestinationReport.details.holds.push({cargoHoldDID, isClean});
      setInspectionDestinationReport(newInspectionDestinationReport);
    }
    setAddingRow(false);
    setCargoHoldDID('');
    setIsClean(false);
  };

  const changeBargeDID = (value) => {
    if (dialogType === 2) {
      console.log("changing barge did");
      let newInspectionOriginReport = JSON.parse(JSON.stringify(inspectionOriginReport));
      newInspectionOriginReport.details.bargeDID = value;
      setInspectionOriginReport(newInspectionOriginReport);
    } else {
      let newInspectionDestinationReport = JSON.parse(JSON.stringify(inspectionDestinationReport));
      newInspectionDestinationReport.details.bargeDID = value;
      setInspectionDestinationReport(newInspectionDestinationReport);
    }
  };

  return (
    <Grid container spacing={0}>
      <TextField
        style={{ marginBottom: 40, marginLeft: 16, width: "90%" }}
        id="barge-did"
        label="Barge DID"
        type="text"
        value={dialogType === 2 ? inspectionOriginReport.details.bargeDID : inspectionDestinationReport.details.bargeDID}
        onChange={ e => {
          changeBargeDID(e.target.value)
        }}
      />
      <TableContainer>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Cargo hold DID</TableCell>
            <TableCell>Clean</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dialogType === 2 ? (
            inspectionOriginReport.details.holds.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.cargoHoldDID}
                </TableCell>
                <TableCell >{row.isClean && <CheckCircleOutlineIcon/>}</TableCell>
                <TableCell >
                  {<IconButton aria-label="delete" onClick={e => deleteRow(index)}>
                    <DeleteIcon />
                  </IconButton>}
                </TableCell>
              </TableRow>
            ))
          ) :
          (
            inspectionDestinationReport.details.holds.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.cargoHoldDID}
                </TableCell>
                <TableCell >{row.isClean && <CheckCircleOutlineIcon/>}</TableCell>
                <TableCell >
                  {<IconButton aria-label="delete" onClick={e => deleteRow(index)}>
                    <DeleteIcon />
                  </IconButton>}
                </TableCell>
              </TableRow>
            ))
          )}
          {addingRow &&
            <TableRow>
              <TableCell component="th" scope="row">
                <TextField
                  style={{marginTop: -8}}
                  id="barge-did"
                  fullWidth
                  label="Cargo hold DID"
                  type="text"
                  value={cargoHoldDID}
                  onChange={ e => {
                    setCargoHoldDID(e.target.value)
                  }}
                  //disabled={cargoType === '' || loading}
                  //error={cargoLoad <= 0}
                  //helperText={cargoLoad <= 0 ? 'Cargo load must be bigger than 0' : ' '}
                />
              </TableCell>
              <TableCell >
                <FormControlLabel
                  style={{marginTop: 8}}
                  control={
                    <Checkbox
                      checked={isClean}
                      onChange={e => setIsClean(!isClean)}
                      name="checkedB"
                      color="Primary"
                    />
                  }
                  label="Cargo hold clean"
                />
              </TableCell>
            </TableRow>
          }
        </TableBody>
      </Table>
    </TableContainer>
    <Grid container style={{marginTop: 10, marginLeft:15}}>
      <Grid>
        
      </Grid>
      <Grid>
       
      </Grid>
    </Grid>
    <Grid
    container
    style={{ paddingTop: 20 }}
    direction="row-reverse"
    justifyContent="flex-start"
    alignItems="center"
    >
      {addingRow ? ( 
        <Grid item>
          <IconButton 
            aria-label="clear" 
            color="secondary" 
            onClick={e => setAddingRow(false)}  
          >
            <ClearIcon />
          </IconButton>
          <IconButton 
            aria-label="sumbit" 
            color="primary" 
            onClick={e => addRow()}
            disabled={ !isClean || cargoHoldDID === '' }
          >
            <CheckIcon />
          </IconButton>
        </Grid>
      ) : (
        <Grid item>
            <IconButton aria-label="add" onClick={e => setAddingRow(true)}>
              <AddIcon color="primary"/>
            </IconButton>
        </Grid>
      ) }
     </Grid>
    </Grid>
  );
}
