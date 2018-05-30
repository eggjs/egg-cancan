'use strict';

/**
 * egg-cancan default config
 * @member Config#cancan
 */
exports.cancan = {
  // method name of current logined user instance
  contextUserMethod: 'user',
  // Enable disable Ability check result cache
  cache: false,
};
