import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Fab, CircularProgress } from '@material-ui/core';
import { OPERATOR } from '../helper';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';

const useStyles = makeStyles({
  container: {
    marginLeft: 7,
    marginTop: 4,
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  input: {
    width: '50%',
  },
  fab:{
    marginLeft: 15,
  }
});

export default function OrderRequiredCredentials(props) {

  const classes = useStyles();

  return (
    <Grid container spacing={1} className={classes.container}>
      <Grid item xs={12}>
        <Typography variant="h6" component="h6">
          Required credentials:
        </Typography>
      </Grid>
      <Grid item sm={8} xs={12} container>
        <Typography variant="subtitle1" component="h6" color="textSecondary">

            { props.role === OPERATOR ? 
              <ul>
                <li>Boating licence</li>
                <li>Barge registration</li>
                <li>Hazardous transport permit</li>
              </ul>
              :
              <ul>
                <li>Barge inspector license</li>
              </ul>
            }

        </Typography>
      </Grid>
      <Grid item xs={12} container className={classes.fab}>
      <label htmlFor="upload-cred">
        <input
          style={{ display: 'none' }}
          id="upload-cred"
          name="upload-cred"
          type="file"
          multiple
          onChange={(e) => props.handleChange(e)}
        />
        <Fab
          color="secondary"
          size="medium"
          component="span"
          aria-label="upload"
          variant="extended"
          disabled={props.loadingFiles}
        >
          {props.credentials.length === 0 ? 
          <CloudUploadOutlinedIcon style={{ marginRight: 7 }}/> :
          <CloudDoneIcon style={{ marginRight: 7 }}/>
          }
          {`${props.credentials.length === 0 ? 'Upload' : 'Change'} credential(s)`}
          </Fab>
          {props.loadingFiles && <CircularProgress size={24} className={classes.buttonProgress} />}
        </label>
      </Grid>
    </Grid>
  );
}
