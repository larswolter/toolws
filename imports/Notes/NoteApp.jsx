import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import localforage from 'localforage';
import { withTracker } from 'meteor/react-meteor-data';

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { AppBar, Toolbar, Typography, Container, Box, Paper, CircularProgress, CssBaseline, IconButton } from '@material-ui/core';
import { HideOnScroll } from '../ui/App';
import ContentEditable from 'react-contenteditable'
import { toolInstances } from '../collections';
import debounce from 'lodash/debounce';
import { myTools } from '../ui/data';
import { makeStyles } from '@material-ui/styles';
import BackIcon from '@material-ui/icons/ArrowBack';
import { withSnackbar } from 'notistack';

export { default as NoteIcon } from '@material-ui/icons/Notes';

const useStyles = makeStyles(() => ({
  editor: {
    marginTop: '15px',
    minHeight: '80vh'
  },
}));

function NoteAppEditor({ tool, match, enqueueSnackbar, history }) {
  const classes = useStyles();
  const [html, setHtml] = useState(tool && tool.content || '');
  const [innerRef, setRef] = useState();

  const handleChange = debounce((evt) => {
    setHtml(evt.target.value);
    toolInstances.update(tool._id, { $set: { content: evt.target.value } });
  }, 1000);
  if (!html && tool && tool.content) {
    setHtml(tool.content);
  }
  return (
    <>
      <HideOnScroll >
        <AppBar>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="go back"
              onClick={() => history.push('/')}
            >
              <BackIcon />
            </IconButton>
            <Typography variant="h6">Notiz</Typography>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      <Container maxWidth="md">
        {tool ?
          <ContentEditable
            className={classes.editor}
            html={html} // innerHTML of the editable div
            onChange={handleChange} // handle innerHTML change
            innerRef={(ref) => {
              if (!innerRef && ref) {
                setRef(ref);
                ref.focus();
                console.log('focusing');
              }
            }}
          />
          :
          <CircularProgress />
        }
      </Container>
    </>
  );
}
NoteAppEditor.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  tool: PropTypes.object,
  enqueueSnackbar: PropTypes.func,
}
const createNote = () => {
  const app = {
    _id: Random.id(32),
    name: 'Note',
    content: '',
    createdOn: new Date()
  }
  Meteor.call('createApp', app);
  return app._id
}

function NotePreview({ tool }) {
  var div = document.createElement("div");
  div.innerHTML = tool && tool.content || '';

  return (<>{div.innerText.substr(0, 100)}</>);
}
NotePreview.propTypes = {
  tool: PropTypes.object,
}

const NoteApp = withSnackbar(withTracker(({ match }) => {
  console.log('try finding', match.params.id);
  return {
    tool: myTools.findOne(match.params.id),
  };
})(NoteAppEditor));


export { NotePreview, NoteApp, createNote };
