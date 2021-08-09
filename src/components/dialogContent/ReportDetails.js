import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@material-ui/core';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

const useStyles = makeStyles({
  textContainer: {
    paddingTop: 1,
    paddingLeft: 3
  },
});

export default function ReportDetails(props) {

  const classes = useStyles(); 
  function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
  } 
  const rows = [
    { cargoHoldDID: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', clean: true },
    { cargoHoldDID: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', clean: true },
    { cargoHoldDID: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', clean: true },
    { cargoHoldDID: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', clean: true },
    { cargoHoldDID: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', clean: true },
  ];
  return (
    <Grid spacing={0}>
      
      <Typography gutterBottom variant="body1" component="h2" style={{paddingLeft: 15}}>
          Barge DID: {"0x123455aaa22"}
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
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                {row.cargoHoldDID}
              </TableCell>
              <TableCell >{row.clean && <CheckCircleOutlineIcon/>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
        
    </Grid>
  );
}
