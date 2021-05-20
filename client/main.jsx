import React from 'react';
import { Router, Route, Switch } from 'react-router';
import { createBrowserHistory } from 'history';
import { Workbox, messageSW } from 'workbox-window';

import { Meteor } from 'meteor/meteor';
import { Reload } from 'meteor/reload';
import { render } from 'react-dom';
import App from '/imports/ui/App'
import '../imports/methods';
import { NoteApp } from '../imports/Notes/NoteApp';
import { ChecklistApp } from '../imports/Checklist/ChecklistApp';
import { SnackbarProvider } from 'notistack';
import { onRouteWithId } from '../imports/ui/data';

Package.appcache = true;

const browserHistory = createBrowserHistory();

const Routes = () => (
  <SnackbarProvider maxSnack={2}>
    <Router history={browserHistory}>
      <Route path="/:type/:id" component={onRouteWithId} />
      <Switch>
        <Route exact path="/Note/:id" component={NoteApp} />
        <Route exact path="/Checklist/:id" component={ChecklistApp} />
        <Route component={App} />
      </Switch>
    </Router>
  </SnackbarProvider>
);

Meteor.startup(() => {
  render(<Routes />, document.getElementById('react-target'));
});

if (!Package.appcache) {
  Package.appcache = {};
  console.log('service-worker: faking existence of AppCache package');
}

if ('serviceWorker' in navigator) {
  console.log('service-worker: service worker available');

  const wb = new Workbox(Meteor.absoluteUrl('sw.js'));
  let retry;
  wb.addEventListener('statechange', (evt) => {
    console.log('service-worker: Active state:' + evt.target.state);
  });
  wb.addEventListener('waiting', (event) => {
    console.log('service-worker: Waiting service worker found');
    if (event.sw) {
      console.log('service-worker: sending command to skip');
      messageSW(event.sw, { type: 'SKIP_WAITING' });
    }
  });
  wb.addEventListener('externalwaiting', (event) => {
    console.log('service-worker: External Waiting service worker found');
    if (event.sw) {
      console.log('service-worker: sending command to skip');
      messageSW(event.sw, { type: 'SKIP_WAITING' });
    }
  });
  let canMigrate = false;
  wb.addEventListener('controlling', (event) => {
    console.log('service-worker: is controlling, retrying migration');
    canMigrate = true;
    if (retry) retry(); else window.location.reload();
  });
  wb.addEventListener('externalactivated', (event) => {
    console.log('service-worker: is external activated, retrying migration');
    canMigrate = true;
    if (retry) retry(); else window.location.reload();
  });
  Reload._onMigrate((r) => {
    if (canMigrate) return [canMigrate];
    console.log('service-worker: force updating service worker...');
    wb.update();
    retry = r;
    return false;
  });
  wb.register();
  console.log('service-worker: registered service worker');
} else {
  console.log('service-worker: service worker not available');
}

