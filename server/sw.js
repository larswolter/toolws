import { Meteor } from 'meteor/meteor';
import { isModern } from 'meteor/modern-browsers';
import { WebApp } from 'meteor/webapp';

import crypto from 'crypto';

WebApp.connectHandlers.use('/sw.js', (req, response) => {
  // set Timeout to ensure that the manifest ist build
  Meteor.setTimeout(async () => {
    const cr = WebApp.categorizeRequest(req);

    let serviceWorker = await Assets.getTextAsync('serviceWorker.js');
    const arch = isModern(cr.browser) ? 'web.browser' : 'web.browser.legacy';

    const clientHash = WebApp.clientPrograms[arch].version;
    const urls = WebApp.clientPrograms[arch].manifest.filter((f) => (f.type !== 'dynamic js') && (f.type !== 'json')).filter((f) => f.url).map((f) => f.url).map((url) => ({ url, revision: clientHash }));
    urls.push({ url: '/', revision: clientHash });
    urls.push({ url: '/chrome-manifest', revision: clientHash });
    serviceWorker = serviceWorker.replace(/CURRENT_CACHE_NAME/g, clientHash);
    serviceWorker = serviceWorker.replace('\'FILES_TO_CACHE\'', JSON.stringify(urls, null, 2));
    if (Meteor.isProduction) {
      serviceWorker = serviceWorker.replace(', debug: true', '');
    }
    response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    console.debug('service-worker: sending service worker ', clientHash, arch, crypto.createHash('md5').update(serviceWorker).digest('hex'));
    response.writeHead(200);
    response.end(serviceWorker);
  }, 3000);
});
