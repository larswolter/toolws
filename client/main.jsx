import React from 'react';
import { Router, Route, Switch } from 'react-router';
import {createBrowserHistory} from 'history';

import { Meteor } from 'meteor/meteor';
import { Reload } from 'meteor/reload';
import { render } from 'react-dom';
import App from '/imports/ui/App'
import '../imports/methods';
import { NotesApp } from '../imports/Notes/NoteApp';
import { ChecklistApp } from '../imports/Checklist/ChecklistApp';

const browserHistory = createBrowserHistory();

const Routes = () => (
  <Router history={browserHistory}>
    <Switch>
      <Route exact path="/Note/:id" component={NotesApp}/>
      <Route exact path="/Checklist/:id" component={ChecklistApp}/>
      <Route component={App}/>
    </Switch>
  </Router>
);

Meteor.startup(() => {
  render(<Routes />, document.getElementById('react-target'));
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(
      Meteor.absoluteUrl('sw.js?arch=web.browser' + (Meteor.isModern ? '' : '.legacy'))).then((swReg) => {
        console.log('registered service worker');
        let canMigrate = false;
        Reload._onMigrate((retry) => {
          !canMigrate && swReg.unregister().then(() => {
            console.log('unregistered service worker, allow migration');
            canMigrate = true;
            retry();
          }).catch(err => console.log('unregistered service worker failed:', err));
          if (canMigrate) return [canMigrate];
          return false;
        });
      });
  }
  
});
