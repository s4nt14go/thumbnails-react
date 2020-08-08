import React, { useState } from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Box, Container } from "@material-ui/core";
import Previews from "./components/Previews";
import BuildIcon from '@material-ui/icons/Build';
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  }
}));

function App() {

  const classes = useStyles();
  const [filename, setFilename] = useState();
  const [s3objects, setS3objects] = useState([]);


  function handleUpload() {
    axios(`${process.env.REACT_APP_GET_PRESIGNED_URL}=${filename.name}`).then(response => {
      // Getting the url from response
      const url = response.data.fileUploadURL;
      axios({
        method: "PUT",
        url: url,
        data: filename,
        headers: { "Content-Type": "multipart/form-data" }
      })
        .then(res => {
          console.log('res', res);
          /*this.setState({
            uploadSuccess: "File upload successfull",
            error: undefined
          });*/
        })
        .catch(err => {
          console.log('err', err);
          /*this.setState({
            error: "Error Occured while uploading the file",
            uploadSuccess: undefined
          });*/
        });
    });
  }

  function handleList() {
    const AWS = require('aws-sdk/global');

    // eslint-disable-next-line
    const S3 = require('aws-sdk/clients/s3');

    // AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY, region: process.env.AWS_REGION });
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

          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            startIcon={<BuildIcon />}
            onClick={handleUpload}
          >
            Upload
          </Button>

          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            startIcon={<BuildIcon />}
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

        </Box>
      </Container>

    </div>
  );
}

export default App;
