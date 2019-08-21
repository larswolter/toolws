import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { withRouter } from 'react-router';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker';
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
import { withSnackbar } from 'notistack'

export const myTools = new Ground.Collection('myTools');
export const myToolIds = new ReactiveVar([]);

const isLoading = new ReactiveVar(true);

localforage.getItem('myToolIds').then((toolIds) => {
  myToolIds.set(toolIds || []);
});
myTools.once('loadend', () => isLoading.set(false));

Tracker.autorun(() => {
  Meteor.subscribe('myTools', myToolIds.get(), () => {
    console.log('subscribed tools');
    myTools.observeSource(toolInstances.find());
  });
});


const MyTools = withSnackbar(withRouter(({ tools, history, enqueueSnackbar }) => {

  const deleteTool = (tool) => {
    const reduced = myToolIds.get().filter(t => t !== tool._id);
    myToolIds.set(reduced);
    localforage.setItem('myToolIds', myToolIds.get()).then(() => {
      enqueueSnackbar('Eintrag gelöscht');
    });
  }

  const shareTool = (tool) => {
    const url = Meteor.absoluteUrl('/' + tool.name + '/' + tool._id);
    if ('share' in navigator) {
      navigator.share({
        title: tool.name,
        text: tool.content,
        url,
      });
    } else {
      navigator.clipboard.writeText(url).then(function () {
        enqueueSnackbar('URL in die Zwischenablage kopiert');
      }, function () {
        enqueueSnackbar('Die URL: ' + url);
      });
    }
  }


  return (
    <Grid container spacing={3}>
      {tools.map(tool =>
        <Grid item xs={6} sm={4} md={3} lg={2} key={tool._id}>
          <Card>
            <CardActionArea onClick={() => history.push(`/${tool.name}/${tool._id}`)}>
              <CardHeader
                subheader={moment(tool.createdOn).format('DD.MM.YY HH:mm')}
              />
              <CardContent>
                {(name => {
                  switch (name) {
                    case 'Note': return <NotePreview tool={tool} />;
                    case 'Checklist': return <ChecklistPreview tool={tool} />;
                  }
                })(tool.name)}
              </CardContent>
            </CardActionArea>
            <CardActions>
              <IconButton aria-label="Delete" onClick={() => deleteTool(tool)}>
                <DeleteIcon />
              </IconButton>
              <IconButton aria-label="Share" onClick={() => shareTool(tool)}>
                <ShareIcon />
              </IconButton>
            </CardActions>
          </Card>

        </Grid>
      )}
    </Grid>
  );
}));

MyTools.propTypes = {
  tools: PropTypes.array.isRequired,
}
const MyToolsContainer = withTracker(() => {
  return {
    isLoading: isLoading.get(),
    tools: myTools.find().fetch(),
  };
})(MyTools);

export default MyToolsContainer;