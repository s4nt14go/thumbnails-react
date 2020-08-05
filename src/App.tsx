import React from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Box, Container } from "@material-ui/core";
import Previews from "./components/Previews";
import BuildIcon from '@material-ui/icons/Build';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  }
}));

function App() {

  const classes = useStyles();

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
          <Previews/>
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            startIcon={<BuildIcon />}
          >
            Generate
          </Button>
        </Box>
      </Container>

    </div>
  );
}

export default App;
