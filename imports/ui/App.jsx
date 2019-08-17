import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Slide from '@material-ui/core/Slide';
import MyToolsContainer from './MyTools';
import { createNote, NoteCard, NoteIcon } from '../Notes/NoteApp';
import { createChecklist, ChecklistCard, ChecklistIcon } from '../Checklist/ChecklistApp';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';

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
        </Box>
      </Container>
      <BottomNavigation
        onChange={(event, newValue) => {
          switch(newValue) {
            case 'Note': createNote();break;
            case 'Checklist': createChecklist();break;
          }
        }}
        showLabels
      >
      <BottomNavigationAction value="Note" label="Notes" icon={<NoteIcon />} />
      <BottomNavigationAction value="Checklist" label="Checklist" icon={<ChecklistIcon />} />
    </BottomNavigation>      
    </React.Fragment>
  );
}
