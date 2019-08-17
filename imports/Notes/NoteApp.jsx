import React from 'react';
//import PropTypes from 'prop-types';

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

export {default as NoteIcon} from '@material-ui/icons/NoteAdd';

// const useStyles = makeStyles(theme => ({
//     root: {
//       padding: theme.spacing(2)
//     },
//   }));

function NoteApp() {
  return(<>Hallo</>);
}
const createNote = ()=> {
  const app = {
    _id: Random.secret(),
    name: 'Note',
    content: '',
    createdOn: new Date()
  }
  Meteor.call('createApp',app);
}

function NotePreview() {
    return (<>...</>);
}

export { NotePreview, NoteApp, createNote };
