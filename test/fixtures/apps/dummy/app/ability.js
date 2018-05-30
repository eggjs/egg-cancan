'use strict';

const { BaseAbility } = require('../../../../../');

class Ability extends BaseAbility {
  constructor(ctx, user) {
    super(ctx, user)

    this.user_id = this.user ? this.user.id : null;
  }

  async rules(action, obj, options = {}) {
    const { type } = options;

    if (type === 'topic') {
      if (action === 'update') {
        return await this.canUpdateTopic(obj);
      }

      if (action === 'delete') {
        return await this.canDeleteTopic(obj);
      }
    }

    return true;
  }

  async canUpdateTopic(obj) {
    if (obj.user_id === this.user_id) return true;
    if (this.user.admin) return true;
    return false;
  }

  async canDeleteTopic(obj) {
    if (this.user.admin) return true;
    return false;
  }
}

module.exports = Ability;
