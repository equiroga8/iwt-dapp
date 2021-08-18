import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, TextField, Button } from "@material-ui/core";
import { ethers } from 'ethers';
import Alert from '@material-ui/lab/Alert';
import BorderColorIcon from '@material-ui/icons/BorderColor';
const EthCrypto = require('eth-crypto');

const useStyles = makeStyles({
  itemContainer: {
    paddingBottom: 20
  },
});

export default function SignData(props) {

  const classes = useStyles();  

  const [payload, setPayload] = useState('');
  const [signature, setSignature] = useState('');

  const signPayload = async () => {
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    /*
    console.log("plain payload");
    console.log(payload);
    console.log("parsed payload");
    console.log(JSON.parse(payload));
    console.log("parsed payload then stringifyed");
    console.log(JSON.stringify(JSON.parse(payload)));
    */
    const newSignature = await signer.signMessage(JSON.stringify(JSON.parse(payload)));
    /*
    const messageHash = EthCrypto.hash.keccak256(JSON.stringify(JSON.parse(payload)));
    const otherSignature = EthCrypto.sign(
      '0x8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61', // privateKey
      messageHash // hash of message
    );
    console.log(otherSignature);
  

    
    const expectedAddress = await signer.getAddress()

    console.log("ISSUING SIGNATURE");
    console.log("ADDR:    ", expectedAddress);
    console.log("SIG      ", newSignature);
    console.log();

    const actualAddress = ethers.utils.verifyMessage(JSON.stringify(JSON.parse(payload)), newSignature)

    console.log("APPROACH 1")
    console.log("EXPECTED ADDR: ", expectedAddress)
    console.log("ACTUAL ADDR:   ", actualAddress)
    console.log()

    const matches = expectedAddress === actualAddress;

    console.log("SIGNATURE VALID:  ", matches)
    console.log()
    
    */
    setSignature(newSignature);

  }

  return (
    <Grid 
      container 
      spacing={0} 
      justifyContent="center"
      alignItems="center"
    >
      <Grid item xs={12} sm={8} md={7} lg={6} xl={5}>
        <Grid item className={classes.itemContainer}>
          <Typography variant="h5" component="h2">
              Sign data
          </Typography>
        </Grid>
        <Grid item className={classes.itemContainer}>
          <TextField
            id="outlined-multiline-payload"
            label="Payload"
            multiline
            fullWidth
            rows={16}
            placeholder="Place the payload that you want to sign here"        
            variant="outlined"
            value={payload}
            onChange={ e => setPayload(e.target.value)}
          />
        </Grid>
        <Grid  
          item
          container
          direction='row-reverse'
          className={classes.itemContainer}
        >
          <Grid item>        
            <label htmlFor="sign-button">
              <Button 
                variant="contained" 
                color="primary"
                onClick={signPayload}
                disabled={payload === ''}
              >
                Sign message
              </Button>
            </label>
          </Grid>
      </Grid>
      </Grid>
      { signature !== '' &&
        <Grid item className={classes.itemContainer}>
          <Alert variant="outlined" severity="warning" icon={<BorderColorIcon fontSize="inherit" />}>
            <Typography variant="body1" style={{ whiteSpace: "nowrap" }}>
              Signature: {signature}
            </Typography>
          </Alert>
        </Grid>
      }
    </Grid>
  );
}