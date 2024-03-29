/* eslint no-console: 0 */
import { Application } from '@curveball/core';
import accessLog from '@curveball/accesslog';

import mainMw from './main-mw';
import { init as initDb } from './database';
import { load } from './server-settings';

import * as dotenv from 'dotenv';

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkgInfo = require('../package.json');
console.info('⚾ %s %s', pkgInfo.name, pkgInfo.version);

var temp_port = process.env.PORT ? parseInt(process.env.PORT, 10) :  8531;
// iisnode hands it's own non-number port along.
const port = Number.isNaN(temp_port) ? process.env.PORT : temp_port;

if (!process.env.PUBLIC_URI) {
  process.env.PUBLIC_URI = 'http://localhost:' + port + '/';
  console.log('PUBLIC_URI environment variable was not set, defaulting to http://localhost:' + port + '/');
}

(async () => {

  process.title = 'a12n-server/' + pkgInfo.version;

  await initDb();
  await load();

  const app = new Application();

  app.use(accessLog({
    blacklist: [],
  }));
  app.use(mainMw());

  // @ts-expect-error
  const httpServer = app.listen(port);
  if (process.env.KEEP_ALIVE_TIMEOUT_MS) {
    httpServer.keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT_MS, 10);
  }

  console.log('Running on \x1b[31m%s\x1b[0m', app.origin + '/');

})().catch( (err) => {

  console.error('Could not start a12n-server');
  console.error(err);
  process.exit(2);

});
