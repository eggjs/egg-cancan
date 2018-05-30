'use strict';

const { BaseAbility } = require('../');

describe('test/base_ability.test.js', () => {
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
      assert.deepEqual({}, ability._cache);
      assert.equal(null, anonymousAbility.user);
      assert.equal(ctx, anonymousAbility.ctx);
    });
  });

  describe('Contxt Cache', () => {
    it('should _cacheKey work', function* () {
      assert.equal('read-{}-{}', ability._cacheKey('read', {}, {}));
      assert.equal('read-{"id":1}-{"type":"foo"}', ability._cacheKey('read', { id: 1 }, { type: 'foo' }));
      assert.equal('update-{"id":1,"name":"aaa"}-{"type":"foo"}', ability._cacheKey('update', { id: 1, name: 'aaa' }, { type: 'foo' }));
    });

    it('should work', async () => {
      res = await ability.can('update', { id: 1 }, { type: 'user' });
      const cacheVal = ability._cache['update-{"id":1}-{"type":"user"}'];
      assert.equal(res, cacheVal);

      ability._cache['update-{"id":1}-{"type":"user"}'] = 'foobar';
      res = await ability.can('update', { id: 1 }, { type: 'user' });
      assert.equal('foobar', res);

      res = await ability.can('read', { id: 1 }, { type: 'user' });
      assert.notEqual('foobar', res);
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
