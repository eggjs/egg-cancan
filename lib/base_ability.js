'use strict';

class BaseAbility {
  constructor(ctx, user) {
    this.ctx = ctx;
    this.user = user || {};
  }

  async can(action, obj, options = {}) {
    const { type } = options;

    return true;
  }
}

module.exports = BaseAbility;
