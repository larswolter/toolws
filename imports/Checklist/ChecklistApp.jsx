import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { AppBar, Toolbar, Typography, Container, Box, CircularProgress, IconButton, InputBase, Grid, Checkbox, Menu, MenuItem } from '@material-ui/core';
import { HideOnScroll } from '../ui/App';
import BackIcon from '@material-ui/icons/ArrowBack';
import { myTools } from '../ui/data';
import MenuIcon from '@material-ui/icons/Menu';

export { default as ChecklistIcon } from '@material-ui/icons/CheckCircleOutline';

function ChecklistPreview({ tool }) {
  return (
    <>
      {tool.content && tool.content.slice(0, 3).map((x, idx) => <div key={idx}>{x.text}</div>)}
    </>);
}
const createChecklist = () => {
  const app = {
    _id: Random.id(32),
    name: 'Checklist',
    content: [{ text: '' }],
    createdOn: new Date()
  }
  Meteor.call('createApp', app);
  return app._id;
}

//const sorter = (a, b) => !a.checked && b.checked ? -1 : (a.checked && !b.checked ? 1 : 0);
function ChecklistAppEditor({ tool, history, menu }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [newElement, setNewElement] = useState(null);
  const sorted = tool && tool.content;
  const refs = {};
  const change = (text, entryId) => {
    Meteor.call('checklistUpdate', { _id: tool._id, entryId, text });
  }
  const check = (checked, entryId) => {
    Meteor.call('checklistCheck', { _id: tool._id, entryId, checked });
  }
  const focus = (cur, offset) => {
    refs[Math.max(Math.min(cur + offset, sorted.length - 1), 0)].focus();
  }
  const keyDown = (e, idx) => {
    if (e.key === 'ArrowDown') focus(idx, 1);
    if (e.key === 'ArrowUp') focus(idx, -1);
    if (e.key === 'Backspace') {
      if (e.target.selectionStart === 0 && idx > 0) {
        Meteor.call('checklistUpdate', { _id: tool._id, entryId: sorted[idx - 1]._id, text: sorted[idx - 1].text + e.target.value });
        Meteor.call('checklistUpdate', { _id: tool._id, entryId: sorted[idx]._id, text: false });
        focus(idx, -1);
        e.preventDefault();
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const entryId = Random.id()
      refs[idx].value = sorted[idx].text.substr(0, e.target.selectionStart);
      Meteor.call('checklistInsert', { _id: tool._id, entryId, after: idx, text: sorted[idx].text.substr(e.target.selectionStart) });
      change(refs[idx].value, sorted[idx]._id);
      setNewElement(entryId);
    }
  }
  function handleMenu(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
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
            <Typography variant="h6" style={{ flexGrow: 1 }}>Checkliste</Typography>

            <IconButton
              aria-label="options"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={!!anchorEl}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { }}>
                Liste leeren
              </MenuItem>

              {menu}
            </Menu>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar />
      <Container maxWidth="md">
        <Box>
          {sorted ?
            sorted.map((e, idx) => {
              return (
                <div key={e._id}>
                  <Grid container spacing={0} alignContent="stretch" alignItems="flex-end">
                    <Grid item>
                      <Checkbox
                        checked={!!e.checked}
                        onChange={(evt, checked) => check(checked, e._id)} />
                    </Grid>
                    <Grid item style={{ flexGrow: 1 }}>
                      <InputBase
                        inputRef={ref => {

                          refs[idx] = ref;
                          if (ref) {
                            if (ref !== document.activeElement) {
                              ref.value = e.text;
                            }
                            if (e._id === newElement) {
                              ref.focus();
                              setNewElement(null);
                            }
                          }
                        }}
                        style={{ width: '100%' }}
                        defaultValue={e.text}
                        onKeyDown={(evt) => keyDown(evt, idx)}
                        onChange={(evt) => change(evt.target.value, e._id)} />
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
  tool: PropTypes.object,
  history: PropTypes.object,
  menu: PropTypes.element,
}

ChecklistPreview.propTypes = {
  tool: PropTypes.object.isRequired,
}
const ChecklistApp = withTracker(({ match, ...props }) => {
  const tool = myTools.findOne(match.params.id);
  if (tool) {
    tool.content = tool.content.map(x => ({ ...x, ref: React.createRef() }));
  }
  return {
    tool,
    ...props
  };
})(ChecklistAppEditor);

export { ChecklistPreview, ChecklistApp, createChecklist };
