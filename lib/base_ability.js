'use strict';

const assert = require('assert');

class CanCanAccessDenied extends Error {
  get name() { return 'CanCanAccessDenied'; }
}
class BaseAbility {
  constructor(ctx, user) {
    this.ctx = ctx;
    this.user = user || null;
    this._cache = {};
    this._cacheEnable = ctx.app.config.cancan.cache;
    this._logEnable = ctx.app.config.cancan.log;
  }

  get CanCanAccessDenied() {
    return CanCanAccessDenied;
  }

  async authorize(action, obj, options) {
    const allow = await this.can(action, obj, options);
    if (!allow) throw new CanCanAccessDenied('Access denied');
  }

  async abilities(obj, options) {
    const [ read, update, _delete ] = await Promise.all([
      this.can('read', obj, options),
      this.can('update', obj, options),
      this.can('delete', obj, options),
    ]);

    return { read, update, delete: _delete };
  }

  async can(action, obj, options = {}) {
    // action must provide
    assert(action, 'action required, for example: ctx.can(\'read\', doc)');

    // can('read', null) always return false
    if (!obj) return false;

    let { type } = options;
    // For egg-sequelize Model instance
    if (!type) {
      if (obj && obj.Model) {
        type = obj.Model.name;
      }
    }

    assert(type, 'Fail get type from obj argument, please present its by options, for example: ctx.can(\'read\', topic, { type: \'topic\' })');

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

    if (!this._cacheEnable) {
      const allow = await this.rules(action, obj, options);
      this.log(action, type, allow);
      return allow;
    }

    const cacheKey = this.cacheKey(action, obj, options);
    if (cacheKey in this._cache) {
      const allow = this._cache[cacheKey];
      this.log(action, type, allow, true);
      return allow;
    }

    const allow = await this.rules(action, obj, options);
    this._cache[cacheKey] = allow;
    this.log(action, type, allow);
    return allow;
  }

  async log(action, type, allow, hit) {
    // can be overridden to log more infomations
    if (this._logEnable) this.ctx.logger.info('[cancan]can %s %s result %s, %s cache', action, type, allow, hit ? 'hit' : 'miss');
  }

  async rules(/* action, obj, options = {} */) {
    // must be overridden
    return true;
  }

  cacheKey(action, obj, options) {
    return `${action}-${JSON.stringify(obj)}-${JSON.stringify(options)}`;
  }
}

module.exports = BaseAbility;
