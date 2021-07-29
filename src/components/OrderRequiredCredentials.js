import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Fab, CircularProgress, FormControl, Select, InputLabel, MenuItem } from '@material-ui/core';
import { hashObjects, roleCredentials } from '../helper';
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
    <Grid container spacing={2} className={classes.container}>
      <Grid item xs={12}>
        <Typography variant="h6" component="h6">
          Required credentials:
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl variant="filled" className={classes.input}>
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            key="role-select"
            labelId="role-select-label"
            id="role-select"
            value={props.role}
            onChange={ e => props.setRole(e.target.value)}
          >
            {[...roleCredentials.keys()].map((role, index) => 
              <MenuItem key={index} value={role}>{role}</MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item sm={8} xs={12} container>
      
        <Typography variant="subtitle1" component="h6" color="textSecondary">
          <ul>
            {roleCredentials.get(props.role).map((credential, index) => <li key={index}>{credential}</li>)}
          </ul>
        </Typography>
      </Grid>
      {props.credentials.length !== 0 && 
        <Grid item sm={8} xs={12} container>
          <Typography variant="body2" component="h6">
            {hashObjects(props.credentials)}
          </Typography>
        </Grid>
      }
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
          Upload credential(s)
          </Fab>
          {props.loadingFiles && <CircularProgress size={24} className={classes.buttonProgress} />}
        </label>
      </Grid>
    </Grid>
  );
}
