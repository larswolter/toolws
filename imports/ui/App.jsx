import React from 'react';
import PropTypes from 'prop-types';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Slide from '@material-ui/core/Slide';
import { Card, CardContent, CardActions, Button } from '@material-ui/core';
import MyToolsContainer from './MyTools';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
};

export default function App(props) {
  const createApp = (name)=>{
    const _id = Random.secret();
    Meteor.call('createApp',{
      name,
      _id
    });
    
  }
  return (
    <React.Fragment>
      <CssBaseline />
      <HideOnScroll {...props}>
        <AppBar>
          <Toolbar>
            <Typography variant="h6">TooLWs</Typography>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      <Container maxWidth="md">
        <Box my={2}>
          <MyToolsContainer />
          <br/><br/>
          <Typography variant="h4">Neues Tool anlegen</Typography>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                Notizen
              </Typography>
              <Typography variant="body2" component="p">
                Einfache Notizen mit ein wenig Formatierung
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={()=>createApp('checklist')}>Erstellen</Button>
            </CardActions>
          </Card>          
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                Checklisten
              </Typography>
              <Typography variant="body2" component="p">
                Listen mit Einträgen zum abhacken
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={()=>createApp('checklist')}>Erstellen</Button>
            </CardActions>
          </Card>          
        </Box>
      </Container>
    </React.Fragment>
  );
}
