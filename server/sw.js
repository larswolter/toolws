/* global Assets */

import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';

const swString = {};
WebApp.connectHandlers.use('/sw.js', (req, response) => {
  const renderSW = function (arch) {
    if (Meteor.isDevelopment || !swString[arch]) {
      const sworker = Assets.getText('serviceWorker.js');
      const urls = WebApp.clientPrograms[arch].manifest.filter((f) => {
        return f.url &&
          (f.cacheable || f.path.match(/\.(?:png|woff2|gif|jpg|jpeg|svg)$/)) &&
          (f.type !== 'dynamic js') &&
          (f.path.indexOf('icons/countries') === -1) &&
          (f.type !== 'json');
      }).map((f) => {
        return {
          revision: f.hash,
          url: f.url.split('?')[0],
        };
      });

      console.log(`created service worker for ${arch} with ${urls.length} urls`);
      swString[arch] = sworker.replace('\'FILES_TO_CACHE\'', JSON.stringify(urls, null, 2));
    }
    return swString[arch];
  };
  response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  response.writeHead(200);
  response.end(renderSW(req.query.arch || 'web.browser'));
});
