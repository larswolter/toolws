import React from 'react';
import PropTypes from 'prop-types';

import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

export {default as ChecklistIcon} from '@material-ui/icons/Description';

// const useStyles = makeStyles(theme => ({
//     root: {
//       padding: theme.spacing(2)
//     },
//   }));
  
function ChecklistApp() {
  return(<>Hallo</>);
}
const createChecklist = ()=> {
  const app = {
    _id: Random.secret(),
    name: 'Checklist',
    content: '',
    createdOn: new Date()
  }
  Meteor.call('createApp',app);
}

function ChecklistPreview({tool}) {
    return (<>...</>);
}

ChecklistPreview.propTypes = {
  tool: PropTypes.object.isRequired
}
export { ChecklistPreview, ChecklistApp, createChecklist };
