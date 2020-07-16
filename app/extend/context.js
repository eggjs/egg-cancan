'use strict';

const ABILITY = Symbol('Context#ability');

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

  async can(...args) {
    return await this.ability.can(...args);
  },

  /**
   * Authorize Ability, if not will throw CanCanAccessDenied error
   * @param {String} action create|update|read|destroy
   * @param {String} obj Model instance or other data
   * @param {Object} options options
   * @param {Object} options.type name of ability, etc: topic|doc, if **obj** is a Sequelize instance, will use obj.Model.name by default
   */

  async authorize(...args) {
    await this.ability.authorize(...args);
  },

  /**
   * Get read, update, delete abilities
   * @param {Object} obj Model instance
   * @param {Object} options options
   * @param {String} options.type name of ability, etc: topic|doc
   * @return {Object} { read: true, update: true, delete: false }
   */

  async abilities(...args) {
    return await this.ability.abilities(...args);
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
