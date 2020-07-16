'use strict';

global.mm = require('egg-mock');

const app = mm.app({ baseDir: 'apps/dummy', plugin: 'dummy' });

before(done => {
  app.ready(done);
});
after(() => app.close());


beforeEach(() => {
  global.app = app;
  global.request = app.httpRequest();
  global.ctx = app.mockContext();
});
