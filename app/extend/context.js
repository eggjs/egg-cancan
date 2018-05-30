'use strict';

const ABILITY = Symbol('Context#ability');

class CancanAccessDenied extends Error {
  get name() { return 'CancanAccessDenied'; }
}

/**
 * Context::Ability
 *
 * 权限相关的函数
 */
module.exports = {
  /**
   * Check ctx.currentUser ability for data
   * @param {String} action create|update|read|delete
   * @param {String} obj Model instance or other data
   * @param {Object} options options
   * @param {Object} options.type name of ability, etc: topic|doc, if **obj** is a Sequelize instance, will use obj.Model.name by default
   * @return {Boolean} true | false
   */
  async can(action, obj, options = {}) {
    return await this.ability.can(action, obj, options);
  },

  /**
   * Authorize Ability, if not will throw CancanAccessDenied error
   * @param {String} action create|update|read|destroy
   * @param {String} obj Model instance or other data
   * @param {Object} options options
   * @param {Object} options.type name of ability, etc: topic|doc, if **obj** is a Sequelize instance, will use obj.Model.name by default
   */
  async authorize(action, obj, options = {}) {
    const allow = await this.can(action, obj, options = {});
    if (!allow) throw new CancanAccessDenied('Access denied');
  },

  /**
   * Get read, update, delete abilities
   * @param {Object} obj Model instance
   * @param {Object} options options
   * @param {String} options.type name of ability, etc: topic|doc
   * @return {Object} { read: true, update: true, delete: false }
   */
  async abilities(obj, options = {}) {
    const [ read, update, _delete ] = await Promise.all([
      this.can('read', obj, options),
      this.can('update', obj, options),
      this.can('delete', obj, options),
    ]);

    const abilities = { read, update, delete: _delete };

    return abilities;
  },

  /**
   * Ability for currentUser
   */
  get ability() {
    if (this[ABILITY]) { return this[ABILITY]; }

    const user = this[this.app.config.cancan.contextUserMethod || 'user'];

    this[ABILITY] = new this.app.Ability(this, user);
    return this[ABILITY];
  },
};
