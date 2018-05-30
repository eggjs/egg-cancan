'use strict';

const { BaseAbility } = require('../');

describe('test/context.test.js', () => {
  class MyAbility extends BaseAbility {
    async rules(action, obj, options = {}) {
      return { action: action, obj: obj, type: options.type };
    }
  }

  // egg-sequelize model instance
  const modelInstance = {
    Model: { name: 'user' },
    id: '123',
    name: 'Jason Lee'
  };

  let user, ability, anonymousAbility, res;
  beforeEach(async () => {
    user = { id: 1 };
    ability = new MyAbility(ctx, user);
    anonymousAbility = new MyAbility(ctx, null);
  })

  describe('Base', () => {
    it('should work', () => {
      assert.equal(user, ability.user);
      assert.equal(ctx, ability.ctx);
      assert.equal(null, anonymousAbility.user);
      assert.equal(ctx, anonymousAbility.ctx);
    });
  });

  describe('Action alias', () => {
    it('should work', async () => {
      res = await ability.can('read', modelInstance);
      assert.equal('read', res.action);
      assert.equal(modelInstance, res.obj);
      assert.equal('user', res.type);

      res = await ability.can('show', modelInstance);
      assert.equal('read', res.action);
      assert.equal('user', res.type);

      res = await ability.can('update', modelInstance);
      assert.equal('update', res.action);

      res = await ability.can('edit', modelInstance);
      assert.equal('update', res.action);

      res = await ability.can('delete', modelInstance);
      assert.equal('delete', res.action);

      res = await ability.can('destroy', modelInstance);
      assert.equal('delete', res.action);
    });
  });

  describe('Auto type from Sequelize model name', () => {
    it('should work', async () => {
      res = await ability.can('read', modelInstance);
      assert.equal('user', res.type);

      res = await ability.can('read', modelInstance, { type: 'aaa' });
      assert.equal('aaa', res.type);
    });
  });
});
