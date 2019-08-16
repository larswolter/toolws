import React from 'react';
import PropTypes from 'prop-types';

import { Meteor } from 'meteor/meteor';
import {ReactiveVar } from 'meteor/reactive-var';
import {Tracker } from 'meteor/tracker';
import { withTracker } from 'meteor/react-meteor-data';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import moment from 'moment';
import localforage from 'localforage';
import { toolInstances } from '../collections';
import { Paper, Typography } from '@material-ui/core';
import { Ground } from 'meteor/ground:db';

export const myTools = new Ground.Collection('myTools');

const isLoading = new ReactiveVar(true);
const myToolIds = new ReactiveVar();
localforage.getItem('myToolIds').then((toolIds)=>{
  myToolIds.set(toolIds);
});
myTools.observeSource(toolInstances.find());
myTools.once('loadend').then(()=>isLoading.set(false));

Tracker.autorun(()=>{
  Meteor.subscribe('myTools',myToolIds.get());
});

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  },
}));

function MyTools({tools}) {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      {tools.length === 0?
        <Typography variant="h4">Keine verfügbaren Tools</Typography>
      :<>
      <Typography variant="h4">Verfügbare Tools</Typography>
      <List className={classes.root}>
        {tools.map(tool=>
          <ListItem key={tool._id}>
            <ListItemText primary={tool.name} secondary={moment(tool.lastUse).format('DD.MM.YYY HH:mm')} />
          </ListItem>
          )}
      </List>
      </>
      }
    </Paper>
  );
}

MyTools.propTypes = {
  tools: PropTypes.array.isRequired,
}
const MyToolsContainer = withTracker(() => {
  return {
    isLoading: isLoading.get(),
    tools: myTools.find().fetch(),
  };
})(MyTools);

export default  MyToolsContainer;