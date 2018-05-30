'use strict';

class BaseAbility {
  constructor(ctx, user) {
    this.ctx = ctx;
    this.user = user || {};
  }

  async can(action, obj, options = {}) {
    let { type } = options;

    // For egg-sequelize Model instance
    if (!type) {
      if (obj && obj.Model) {
        type = obj.Model.name;
      }
    }

    if (!type) {
      throw new Error('Fail get type from obj argument, please present its by options, for example: ctx.can(\'read\', topic, { type: \'topic\' })');
    }

    switch (action) {
      case 'show':
        action = 'read';
        break;
      case 'new':
        action = 'create';
        break;
      case 'edit':
        action = 'update';
        break;
      case 'destroy':
        action = 'delete';
        break;
      default:
        break;
    }
    options.type = type;

    return await this.rules(action, obj, options);
  }

  async rules(action, obj, options = {}) {
    const { type } = options;

    return true;
  }
}

module.exports = BaseAbility;
