import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import localforage from 'localforage';
import DeleteIcon from '@material-ui/icons/Delete';
import ShareIcon from '@material-ui/icons/Share';
import NfcIcon from '@material-ui/icons/Nfc';
import moment from 'moment';

import { ChecklistPreview } from '../Checklist/ChecklistApp';
import { Card, CardContent, CardActions, Button, CardHeader, IconButton, CardActionArea, MenuItem } from '@material-ui/core';
import { NotePreview } from '../Notes/NoteApp';
import { Grid } from '@material-ui/core';
import { withSnackbar } from 'notistack'
import { myToolIds, myTools, addItemId } from './data';
import QRDialog from './qrdialog';


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
  const [qrcode, setQRCode] = React.useState(false);
  const shareToolQR = (tool) => {
    const url = Meteor.absoluteUrl('/' + tool.name + '/' + tool._id);
    setQRCode(url);
  }
  const shareTool = (tool) => {
    const url = Meteor.absoluteUrl('/' + tool.name + '/' + tool._id);
    if ('share' in navigator) {
      navigator.share({
        title: tool.name,
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

  const menu = (tool) =>
    <>
      <MenuItem onClick={() => shareTool(tool)}>
        Teilen
    </MenuItem>
      <MenuItem onClick={() => shareToolQR(tool)}>
        QRCode
    </MenuItem>
      <MenuItem onClick={() => deleteTool(tool)}>
        Löschen
    </MenuItem>

    </>
  return (
    <>
      <QRDialog key="dialog" url={qrcode} open={!!qrcode} handleClose={() => setQRCode(false)} />
      <Grid container spacing={3}>
        {tools.length ? tools.map(tool =>
          <Grid item xs={12} sm={6} md={4} lg={3} key={tool._id}>
            <Card>
              <CardActionArea onClick={() => history.push(`/${tool.name}/${tool._id}`)}>
                <CardHeader
                  subheader={moment(tool.createdOn).format('DD.MM.YY HH:mm')}
                />
                <CardContent>
                  {(name => {
                    switch (name) {
                      case 'Note': return <NotePreview tool={tool} menu={menu(tool)} />;
                      case 'Checklist': return <ChecklistPreview tool={tool} menu={menu(tool)} />;
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
                <IconButton aria-label="Share" onClick={() => shareToolQR(tool)}>
                  <NfcIcon />
                </IconButton>
              </CardActions>
            </Card>

          </Grid>
        ) : <div style={{ color: 'gray', minHeight: '50vh', textAlign: 'center', padding: 20, paddingTop: '20vh' }}>
            Keine vorhanden, klicke unten um eines zu erstellen
        </div>}
      </Grid>
    </>
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