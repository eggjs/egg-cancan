'use strict';

class BaseAbility {
  constructor(ctx, user) {
    this.ctx = ctx;
    this.user = user || {};
  }

  async can(action, type, obj) {
    return true;
  }
}

module.exports = BaseAbility;
