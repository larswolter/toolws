import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { withRouter } from 'react-router';

import { Meteor } from 'meteor/meteor';
import {ReactiveVar } from 'meteor/reactive-var';
import {Tracker } from 'meteor/tracker';
import { withTracker } from 'meteor/react-meteor-data';
import localforage from 'localforage';
import { toolInstances } from '../collections';
import { Ground } from 'meteor/ground:db';
import DeleteIcon from '@material-ui/icons/Delete';
import ShareIcon from '@material-ui/icons/Share';
import moment from 'moment';

import { ChecklistPreview } from '../Checklist/ChecklistApp';
import { Card, CardContent, CardActions, Button, Typography, makeStyles, CardHeader, IconButton, CardActionArea } from '@material-ui/core';
import { NotePreview } from '../Notes/NoteApp';
import { Grid } from '@material-ui/core';

export const myTools = new Ground.Collection('myTools');
export const myToolIds = new ReactiveVar();

const isLoading = new ReactiveVar(true);

localforage.getItem('myToolIds').then((toolIds)=>{
  myToolIds.set(toolIds||[]);
});
myTools.observeSource(toolInstances.find());
myTools.once('loadend',()=>isLoading.set(false));

Tracker.autorun(()=>{
  Meteor.subscribe('myTools',myToolIds.get());
});

const MyTools = withRouter(({tools,history})=> {
  console.log(tools);
  return (
    <Grid container spacing={3}>
      {tools.map(tool=>
        <Grid item xs={6} sm={4} md={3} lg={2} key={tool._id}>
          <Card>
            <CardActionArea  onClick={()=>history.push(`/${tool.name}/${tool._id}`)}>
              <CardHeader 
                title={tool.name}
                subheader={moment(tool.createdOn).format('DD.MM.YY HH:mm')}
              />
              <CardContent>
                {(name=>{
                  switch(name) {
                    case 'Note': return <NotePreview tool={tool}/>;
                    case 'Checklist': return <ChecklistPreview tool={tool}/>;
                  }
                })(tool.name)}
              </CardContent>
            </CardActionArea>
            <CardActions>
              <IconButton aria-label="add to favorites">
                <DeleteIcon />
              </IconButton>
              <IconButton aria-label="add to favorites">
                <ShareIcon />
              </IconButton>
            </CardActions>
          </Card>          

        </Grid>
      )}
    </Grid>
  );
});

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