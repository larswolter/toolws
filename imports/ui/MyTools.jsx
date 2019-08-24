import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import localforage from 'localforage';
import DeleteIcon from '@material-ui/icons/Delete';
import ShareIcon from '@material-ui/icons/Share';
import moment from 'moment';

import { ChecklistPreview } from '../Checklist/ChecklistApp';
import { Card, CardContent, CardActions, Button, CardHeader, IconButton, CardActionArea } from '@material-ui/core';
import { NotePreview } from '../Notes/NoteApp';
import { Grid } from '@material-ui/core';
import { withSnackbar } from 'notistack'
import { myToolIds, myTools, addItemId } from './data';


const MyTools = withSnackbar(withRouter(({ tools, history, enqueueSnackbar, closeSnackbar }) => {

  const deleteTool = (tool) => {
    const reduced = myToolIds.get().filter(t => t !== tool._id);
    myToolIds.set(reduced);
    localforage.setItem('myToolIds', myToolIds.get()).then(() => {
      const snack = enqueueSnackbar('Eintrag gelöscht', {
        action:
          <Button color="secondary" size="small" onClick={() => {
            addItemId(tool._id);
            closeSnackbar(snack);
          }}>
            Rückgängig
          </Button>
      });
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
      {tools.length ? tools.map(tool =>
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
      ) : <div style={{ color: 'gray', minHeight: '50vh', textAlign: 'center', padding: 20, paddingTop: '20vh' }}>
          Keine vorhanden, klicke unten um eines zu erstellen
        </div>}
    </Grid>
  );
}));

MyTools.propTypes = {
  tools: PropTypes.array.isRequired,
}
const MyToolsContainer = withTracker(() => {
  return {
    isLoading: false,
    tools: myTools.find().fetch(),
  };
})(MyTools);

export default MyToolsContainer;