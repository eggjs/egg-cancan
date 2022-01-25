'use strict';

const assert = require('assert');
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
      assert(ability.CanCanAccessDenied.name === 'CanCanAccessDenied');
      assert(ability.CanCanAccessDenied === anonymousAbility.CanCanAccessDenied);
    });
  });

  describe('authorize', () => {
    it('should work', async () => {
      mm(ability, 'rules', async action => {
        if (action === 'read') return true;
        return false;
      });

      await ability.authorize('read', modelInstance);
      await assert.rejects(async () => {
        await ability.authorize('update', modelInstance);
      }, err => {
        assert(err.name === 'CanCanAccessDenied');
        assert(err.action === 'update');
        assert(err.type === 'user');
        assert(err.object === modelInstance);
        return true;
      });
    });
  });

  describe('abilities', () => {
    it('should work', async () => {
      mm(ability, 'rules', async action => {
        if (action === 'read') return true;
        return false;
      });

      const res = await ability.abilities(modelInstance);
      assert(res.read === true);
      assert(res.update === false);
      assert(res.delete === false);
    });
  });

  describe('Contxt Cache', () => {
    it('should cacheKey work', function* () {
      assert.equal('read-{}-{}', ability.cacheKey('read', {}, {}));
      assert.equal('read-{"id":1}-{"type":"foo"}', ability.cacheKey('read', { id: 1 }, { type: 'foo' }));
      assert.equal('read-{"id":1,"user":{"name":"foo"}}-{"type":"foo"}', ability.cacheKey('read', { id: 1, user: { name: 'foo' } }, { type: 'foo' }));
      assert.equal('update-{"id":1,"name":"aaa"}-{"type":"foo"}', ability.cacheKey('update', { id: 1, name: 'aaa' }, { type: 'foo' }));
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

    it('should disable cache', async () => {
      const obj = { id: 1 };
      const options = { type: 'user' };

      ability._cache['read-{"id":1}-{"type":"user"}'] = 'foobar';
      res = await ability.can('read', obj, options);
      assert.equal('foobar', res);

      mm(ability, '_cacheEnable', false);

      res = await ability.can('read', obj, options);
      assert.notEqual('foobar', res);
      assert.equal('read', res.action);
      assert.equal(obj, res.obj);
      assert.equal(options.type, res.type);
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

      res = await ability.can('new', modelInstance);
      assert.equal('create', res.action);
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

  describe('log', () => {
    beforeEach(() => {
      mm(app.config.cancan, 'log', true);
      mm(app.config.cancan, 'cache', true);
      ability = new BaseAbility(ctx, user);
    });

    it('should work', async () => {
      app.mockLog();
      res = await ability.can('read', modelInstance);
      app.expectLog('[cancan]can read user result true, miss cache');
      res = await ability.can('read', modelInstance);
      app.expectLog('[cancan]can read user result true, hit cache');
    });
  });
});
