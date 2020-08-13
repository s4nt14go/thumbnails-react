import React, { useState } from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
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
import DisplayUrls from './components/DisplayUrls';
import Url from "./components/Url";

// region ---------------------------------------------------- s3.listObjectsV2 setup
const AWS = require('aws-sdk/global');
// eslint-disable-next-line
const S3 = require('aws-sdk/clients/s3');
AWS.config.update({ accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY, secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY });
const s3 = new AWS.S3();
// endregion

function App() {

  // region ---------------------------------------------------- Upload feedback
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
  // endregion

  // region ---------------------------------------------------- Upload
  const [disableUpload, setDisableUpload] = useState(true);
  const [filename, setFilename] = useState();
  function handleUpload() {
    setInProgress(true);
    console.log('REACT_APP_GET_PRESIGNED_URL', process.env.REACT_APP_GET_PRESIGNED_URL);
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
  // endregion

  // region ---------------------------------------------------- List S3 objects
  const [s3objects, setS3objects] = useState([]);
  function handleList() {
    s3.listObjectsV2({ Bucket: `${process.env.REACT_APP_S3_BUCKET}-resized` }, (err:any, data:any) => {
      if (err) {
        console.log('Error received');
        throw err;
      }
      console.log(data.Contents);
      setS3objects(data.Contents);
    })
  }
  function mapProps(s3object: any) {
    return {
      id: s3object.ETag,
      url: `https://${process.env.REACT_APP_S3_BUCKET}-resized.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${s3object.Key}`,
    }
  }
  // endregion

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

          <DisplayUrls />

          <Previews setFilename={setFilename} setDisableUpload={setDisableUpload} />
          {inProgress? <LinearProgress color="secondary" /> : <div style={{height: 4}}> </div>}<br />

          <Button
            variant="contained"
            color="secondary"
            startIcon={<CloudUploadIcon />}
            onClick={handleUpload}
            disabled={disableUpload}
          >
            Upload
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<ReorderIcon />}
            onClick={handleList}
          >
            List
          </Button>

          <br /><br />
          {s3objects.length?
            <Url urls={s3objects.map(mapProps)} />
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
