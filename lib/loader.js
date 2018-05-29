'use strict';

const path = require('path');

module.exports = app => {
  const appAbilityPath = path.join(app.options.baseDir, 'app/ability.js');
  app.Ability = app.loader.requireFile(appAbilityPath);
};
