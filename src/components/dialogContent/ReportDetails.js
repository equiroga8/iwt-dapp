import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

const useStyles = makeStyles({
  textContainer: {
    paddingTop: 1,
    paddingLeft: 3
  },
});

export default function ReportDetails(props) {
  const { dialogType, inspectionOriginReport, inspectionDestinationReport, loadingDialog, ...other } = props; 

  const classes = useStyles(); 
  const getInspectorSignature = () => {
    let text = 'Inspector signature: ';
    if (dialogType === 3 || dialogType === 4) {
      if (inspectionOriginReport.inspectorSignature === null) {
        text += '-';
      } else {
        text += 'Yes';
      }
    } else {
      if (inspectionDestinationReport.inspectorSignature === null) {
        text += '-';
      } else {
        text += 'Yes';
      }
    }
    return text;
  }

  const getOperatorSignature = () => {
    let text = 'Operator signature: ';
    if (dialogType === 3 || dialogType === 4) {
      if (inspectionOriginReport.operatorSignature === null) {
        text += '-';
      } else {
        text += 'Yes';
      }
    } else {
      if (inspectionDestinationReport.operatorSignature === null) {
        text += '-';
      } else {
        text += 'Yes';
      }
    }
    return text;
  }
  return (
    <Grid spacing={0}>
      
      <Typography gutterBottom variant="body1" component="h2" style={{paddingLeft: 15, marginBottom: 40, marginTop: 10}}>
          Barge DID: {dialogType === 3 || dialogType === 4 ? inspectionOriginReport.details.bargeDID : inspectionDestinationReport.details.bargeDID}
      </Typography>
      <TableContainer>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Cargo hold DID</TableCell>
            <TableCell>Clean</TableCell>
            
          </TableRow>
        </TableHead>
        <TableBody>
          {dialogType === 3 || dialogType === 4 ? (
            inspectionOriginReport.details.holds.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.cargoHoldDID}
                </TableCell>
                <TableCell >{row.isClean && <CheckCircleOutlineIcon/>}</TableCell>
              </TableRow>
            ))
          ) : (
            inspectionDestinationReport.details.holds.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.cargoHoldDID}
                </TableCell>
                <TableCell >{row.isClean && <CheckCircleOutlineIcon/>}</TableCell>
              </TableRow>
            ))
          )
          }
        </TableBody>
      </Table>
    </TableContainer>
    <Typography gutterBottom variant="body1" component="h2" style={{paddingLeft: 15, marginTop: 40}}>
          {getInspectorSignature()}
    </Typography>
    <Typography gutterBottom variant="body1" component="h2" style={{paddingLeft: 15}}>
          {getOperatorSignature()}
    </Typography>
    </Grid>
  );
}
