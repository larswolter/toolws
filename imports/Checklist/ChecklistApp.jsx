import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { AppBar, Toolbar, Typography, Container, Box, Paper, CircularProgress, IconButton, InputBase, Grid, Checkbox } from '@material-ui/core';
import { HideOnScroll } from '../ui/App';
import BackIcon from '@material-ui/icons/ArrowBack';
import { makeStyles } from '@material-ui/styles';
import { myTools } from '../ui/MyTools';
import CheckIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckedIcon from '@material-ui/icons/CheckBoxOutlined';
import { keys } from '@material-ui/core/styles/createBreakpoints';
import debounce from 'lodash/debounce';
import { toolInstances } from '../collections';

export { default as ChecklistIcon } from '@material-ui/icons/CheckCircleOutline';

const useStyles = makeStyles(() => ({
  paper: {
    padding: 16
  },
}));

function ChecklistPreview({ tool }) {
  return (
    <>
      {tool.content && tool.content.slice(0, 3).map((x, idx) => <div key={idx}>{x.text}</div>)}
    </>);
}
const createChecklist = () => {
  const app = {
    _id: Random.secret(),
    name: 'Checklist',
    content: [{ text: '' }],
    createdOn: new Date()
  }
  Meteor.call('createApp', app);
  return app._id;
}

function ChecklistAppEditor({ tool }) {
  const [content, setContent] = useState(tool && tool.content || []);
  const classes = useStyles();
  const refs = {};
  const change = (e, idx) => {
    const newContent = content.map((x, i) => {
      if (idx === i) return { ...x, text: e.target.value };
      return x;
    });
    setContent(newContent);
    toolInstances.update(tool._id, { $set: { content: newContent } });
  }
  const check = (e, idx) => {
    const newContent = content.map((x, i) => {
      if (idx === i) return { ...x, checked: e };
      return x;
    });
    setContent(newContent);
    toolInstances.update(tool._id, { $set: { content: newContent } });
  }

  const keyPress = (e, idx) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (refs[idx + 1]) {
        refs[idx + 1].focus();
      } else {
        setContent(content.concat([{ text: '' }]));
      }
    }
  }
  if ((content.length === 0) && tool) {
    setContent(tool.content || [{ text: '' }]);
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
              onClick={() => history.back()}
            >
              <BackIcon />
            </IconButton>
            <Typography variant="h6">Checkliste</Typography>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      <Container maxWidth="md">
        <Box my={1}>
          {tool ?
            content.map((e, idx) => {
              return (
                <div key={idx}>
                  <Grid container spacing={1} alignContent="stretch" alignItems="flex-end">
                    <Grid item>
                      <Checkbox
                        checked={!!e.checked}
                        onChange={(evt, checked) => check(checked, idx)} />
                    </Grid>
                    <Grid item style={{ flexGrow: 1 }}>
                      <InputBase
                        autoFocus={e.text === '' ? true : undefined}
                        inputRef={(ref) => { refs[idx] = ref }}
                        style={{ width: '100%' }}
                        value={e.text}
                        onKeyPress={(evt) => keyPress(evt, idx)}
                        onChange={(evt) => change(evt, idx)} />
                    </Grid>
                  </Grid>
                </div>);
            }) :
            <CircularProgress />
          }
        </Box>
      </Container>
    </>
  );
}
ChecklistAppEditor.propTypes = {
  tool: PropTypes.object
}

ChecklistPreview.propTypes = {
  tool: PropTypes.object.isRequired
}
const ChecklistApp = withTracker(({ match }) => {
  return {
    tool: myTools.findOne(match.params.id),
  };
})(ChecklistAppEditor);

export { ChecklistPreview, ChecklistApp, createChecklist };
