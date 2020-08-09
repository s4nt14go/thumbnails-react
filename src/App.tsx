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
import DisplayUrls from './displayUrls';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  }
}));

//----------------------------------------------------region s3.listObjectsV2 setup
const AWS = require('aws-sdk/global');
// eslint-disable-next-line
const S3 = require('aws-sdk/clients/s3');
AWS.config.update({ accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY, secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY });
const s3 = new AWS.S3();
//----------------------------------------------------endregion

function App() {

  const classes = useStyles();
  const [filename, setFilename] = useState();
  const [s3objects, setS3objects] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [disableUpload, setDisableUpload] = useState(true);

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
            className={classes.button}
            startIcon={<CloudUploadIcon />}
            onClick={handleUpload}
            disabled={disableUpload}
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
              // @ts-ignore
              return <div key={o.ETag}>
                {`${filename}`}<br />
                <img alt={`s3 hosted ${i}`} src={`https://${process.env.REACT_APP_S3_BUCKET}-resized.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${filename}`} /><br /><br />
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
