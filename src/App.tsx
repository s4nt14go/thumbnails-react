import React, { useState } from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import Previews from './components/Previews';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import ReorderIcon from '@material-ui/icons/Reorder';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  }
}));

const AWS = require('aws-sdk/global');
// eslint-disable-next-line
const S3 = require('aws-sdk/clients/s3');
AWS.config.update({ accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY, secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY, region: process.env.REACT_APP_AWS_REGION });
const s3 = new AWS.S3();
/* Configurar el bucket deshabilitando el bloqueo a acceso público y agregando en CORS:
      <CORSConfiguration>
       <CORSRule>
         <AllowedOrigin>*</AllowedOrigin>
         <AllowedMethod>GET</AllowedMethod>
         <AllowedHeader>*</AllowedHeader>
       </CORSRule>
      </CORSConfiguration>*/

function App() {

  const classes = useStyles();
  const [filename, setFilename] = useState();
  const [s3objects, setS3objects] = useState([]);
  const [inProgress, setInProgress] = useState(false);

  type Severity = 'success' | 'error';
  const [feedback, setFeedback] = useState({
    open: false,
    severity: 'success' as Severity,
    text: '',
  });

  function handleClose() {
    setFeedback(s => ({...s, open: false}));
  }

  function handleUpload() {
    setInProgress(true);
    axios(`${process.env.REACT_APP_GET_PRESIGNED_URL}=${filename.name}`).then(response => {
      // Getting the url from response
      console.log('presigned url', response.data.fileUploadURL);
      axios({
        method: "PUT",
        url: response.data.fileUploadURL,
        data: filename,
        headers: { "Content-Type": "multipart/form-data" }
      })
        .then(_res => {
          setFeedback({
            open: true,
            severity: 'success',
            text: 'File successfully uploaded!',
          });
          setInProgress(false);
        })
        .catch(err => {
          console.log('err', err);
          setFeedback({
            open: true,
            severity: 'error',
            text: err.toString(),
          });
          setInProgress(false);
        }).finally(() => setInProgress(false));
    });
  }

  function handleList() {

    s3.listObjectsV2({ Bucket: process.env.REACT_APP_S3_BUCKET }, (err:any, data:any) => {
      if (err) {
        console.log('Error received');
        throw err;
      }
      setS3objects(data.Contents);
    })
  }

  return (

    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className='title'>
            Thumbnails generator
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth='md'>
        <Box my={4} className='box'>

          <Previews setFilename={setFilename} />
          {inProgress? <LinearProgress color="secondary" /> : <div style={{height: 4}}> </div>}<br />

          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            startIcon={<CloudUploadIcon />}
            onClick={handleUpload}
          >
            Upload
          </Button>

          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            startIcon={<ReorderIcon />}
            onClick={handleList}
          >
            List
          </Button>

          <br /><br />
          {s3objects.length?
            s3objects.map((o, i) => {
              // @ts-ignore
              const filename = o.Key;
              return <div key={i}>
                {`${filename}`}<br />
                <img alt={`s3 hosted ${i}`} src={`${process.env.REACT_APP_S3_URL}/${filename}`} /><br /><br />
              </div>
            })
            : null}

          <Snackbar open={feedback.open} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={feedback.severity}>
              {feedback.text}
            </Alert>
          </Snackbar>

        </Box>
      </Container>

    </div>
  );
}

export default App;
