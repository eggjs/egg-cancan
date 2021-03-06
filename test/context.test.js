'use strict';

const assert = require('assert');

describe('test/context.test.js', () => {
  // egg-sequelize model instance
  const modelInstance = {
    Model: { name: 'user' },
    id: '123',
    name: 'Jason Lee'
  };

  describe('.ability', () => {
    it('should work', async () => {
      assert.ok(ctx.ability);
      assert.equal(true, ctx.ability instanceof app.Ability);
    });
  });

  describe('.can', () => {
    it('should work', async () => {
      assert.ok(ctx.can);
      assert.equal(true, await ctx.can('read', {}, { type: 'User' }));
      assert.equal(false, await ctx.can('read', null));
      assert.equal(false, await ctx.can('read'));
    });

    it('should alias action work', async () => {
      mm(ctx.ability, 'rules', async (action, obj, options) => {
        if (action === 'read') return 'read';
        if (action === 'update') return 'update';
        if (action === 'delete') return 'delete';
      });
      assert.equal('read', await ctx.can('read', modelInstance));
      assert.equal('read', await ctx.can('show', modelInstance));
      assert.equal('update', await ctx.can('update', modelInstance));
      assert.equal('update', await ctx.can('edit', modelInstance));
      assert.equal('delete', await ctx.can('delete', modelInstance));
      assert.equal('delete', await ctx.can('destroy', modelInstance));
    });

    it('should throw error when type not exist', async () => {
      await assert.rejects(async () => {
        await ctx.can('read', { id: 1 });
      }, err => {
        assert.equal(`Fail get type from obj argument, please present its by options, for example: ctx.can('read', topic, { type: 'topic' })`, err.message);
        return true;
      });
    });

    it('should throw error when action not exist', async () => {
      await assert.rejects(async () => {
        await ctx.can();
      }, err => {
        assert.equal(`action required, for example: ctx.can('read', doc)`, err.message);
        return true;
      });
    });
  });

  describe('.authorize', () => {
    it('should work', async () => {
      assert.ok(ctx.authorize);

      await ctx.authorize('read', modelInstance)

      mm(ctx, 'can', async () => { return false; });
      try {
        await ctx.authorize('read', modelInstance)
      } catch (e) {
        assert.equal('CanCanAccessDenied', e.name);
      }

      mm(ctx, 'can', async (action, obj, options) => {
        if (action === 'read' && obj.id === 1 && options.type === 'user') {
          return true;
        }
        return false;
      });

      await ctx.authorize('read', { id: 1 }, { type: 'user' });

      try {
        await ctx.authorize('read', { id: 1 }, { type: 'user1' })
      } catch (e) {
        assert.equal('CanCanAccessDenied', e.name);
      }
    });
  });

  describe('.abilities', () => {
    let abilities;
    it('should work', async () => {
      assert.ok(ctx.abilities);
      mm(ctx.ability, 'can', async (action, obj, options) => {
        if (obj === null) return false;
        if (action === 'read') return true;
        if (options && options.type === 'comment') return true;
        return false;
      });

      abilities = await ctx.abilities(null);
      assert.equal(false, abilities.read);
      assert.equal(false, abilities.update);
      assert.equal(false, abilities.delete);

      abilities = await ctx.abilities({});
      assert.equal(true, abilities.read);
      assert.equal(false, abilities.update);
      assert.equal(false, abilities.delete);

      abilities = await ctx.abilities({}, { type: 'comment' });
      assert.equal(true, abilities.read);
      assert.equal(true, abilities.update);
      assert.equal(true, abilities.delete);
    });
  });

  describe('Real case', () => {
    let can;
    describe('Anonymous', () => {
      it('should work', async () => {
        mm(ctx, 'user', null);
      });
    });

    describe('Normal User', () => {
      it('should work', async () => {
        const topic = { id: 1, user_id: 123 };
        mm(ctx, 'user', { id: 10 });

        can = await ctx.can('read', topic, { type: 'topic' });
        assert.equal(true, can);
        can = await ctx.can('update', topic, { type: 'topic' });
        assert.equal(false, can);
        can = await ctx.can('delete', topic, { type: 'topic' });
        assert.equal(false, can);
      });

      it('should work for Topic author', async () => {
        const topic = { id: 1, user_id: 10 };
        mm(ctx, 'user', { id: 10 });

        can = await ctx.can('read', topic, { type: 'topic' });
        assert.equal(true, can);
        can = await ctx.can('update', topic, { type: 'topic' });
        assert.equal(true, can);
        can = await ctx.can('delete', topic, { type: 'topic' });
        assert.equal(false, can);
      });
    });

    describe('Admin', () => {
      it('should work', async () => {
        const topic = { id: 1, user_id: 10 };
        mm(ctx, 'user', { id: 2, admin: true });

        can = await ctx.can('create', topic, { type: 'topic' });
        assert.equal(true, can);
        can = await ctx.can('read', topic, { type: 'topic' });
        assert.equal(true, can);
        can = await ctx.can('update', topic, { type: 'topic' });
        assert.equal(true, can);
        can = await ctx.can('delete', topic, { type: 'topic' });
        assert.equal(true, can);
      });
    });
  });
});
