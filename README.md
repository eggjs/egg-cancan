# egg-cancan

[Cancancan](https://github.com/CanCanCommunity/cancancan) like authorization plugin for Egg.js

> This plugin is our best practice from we developing [yuque.com](https://yuque.com).

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-cancan.svg
[npm-url]: https://npmjs.org/package/egg-cancan
[travis-image]: https://img.shields.io/travis/eggjs/egg-cancan.svg
[travis-url]: https://travis-ci.org/eggjs/egg-cancan
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-cancan.svg
[codecov-url]: https://codecov.io/github/eggjs/egg-cancan?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-cancan.svg
[david-url]: https://david-dm.org/eggjs/egg-cancan
[snyk-image]: https://snyk.io/test/npm/egg-cancan/badge.svg
[snyk-url]: https://snyk.io/test/npm/egg-cancan
[download-image]: https://img.shields.io/npm/dm/egg-cancan.svg
[download-url]: https://npmjs.org/package/egg-cancan

<!--
Description here.
-->

## Install

```bash
$ npm i egg-cancan --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.cancan = {
  enable: true,
  package: 'egg-cancan',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.cancan = {
};
```

## Defining Abilities

You must create `app/ability.js` file

The Ability class is where all user permissions are defined. An example class looks like this.

```js
'use strict';

const { BaseAbility } = require('egg-cancan');

class Ability extends BaseAbility {
  constructor(ctx, user) {
    super(ctx, user)
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
    if (topic.user_id === this.user_id) return true;
    return false;
  }

  async canDeleteTopic(obj) {
    if (this.user.admin) return true;
    return false;
  }
}
```

### Action alias

| Action | Alias |
| ------ | ----- |
| read   | show, read |
| update | edit, update |
| create | new, create |
| delete | destroy, delete |

## Check Abilities

The `ctx.can` method:

```js
can = await ctx.can('create', topic, { type: 'topic' });
can = await ctx.can('read', topic, { type: 'topic' });
can = await ctx.can('update', topic, { type: 'topic' });
can = await ctx.can('delete', topic, { type: 'topic' });

can = await ctx.can('update', user, { type: 'user' });

// For egg-sequelize model instance, not need pass `:type` option
const topic = await ctx.model.Topic.findById(...);
can = await ctx.can('update', topic);
```

The `ctx.authorize` method:

```js
await ctx.authorize('read', topic);
// when permission is ok, not happend
// when no permission, will throw CancanAccessDenied
```

## Handle Unauthorized Access

If the `ctx.authorize` check fails, a `CanCanAccessDenied`error will be throw. You can catch this and modify its behavior:

Add new file: `app/middleware/handle_authorize.js`

```js
module.exports = () => {
  return async handleAuthorize(next) {
    try {
      await next();
    } catch (e) {
      if (e.name === 'CancanAccessDenied') {
        this.status = 403;
        this.body = 'Access Denied';
      } else {
        throw e;
      }
    }
  }
}
```

And enable this middleware by modify `config/config.default.js`:

```js
exports.middleware = [
  ...
  'handleAuthorize',
  ...
];
```

## Testing your abilities

When you wrote `app/ability.js`, you may need to write test case.

- egg-sequelize
- factory-girl-sequelize
- power-assert

Create a test file: `test/ability.test.js`

```js
'use strict';

describe('Ability', () => {
  let allow, user, ability, anonymousAbility;

  beforeAll(async () => {
    user = await create('user');
    ability = new app.Ability(ctx, user);
  });

  describe('Topic', () => {
    describe('Anonymous', () => {
      it('should work', async () => {
        const topic = await create('topic');
        allow = await ability.can('create', topic);
        assert.equal(true, allow);
        allow = await ability.can('read', topic);
        assert.equal(true, allow);
        allow = await ability.can('update', topic);
        assert.equal(false, allow);
        allow = await ability.can('destroy', topic);
        assert.equal(false, allow);
      });
    });

    describe('Author', () => {
      it('should work', async () => {
        const topic = await create('topic', { user_id: user.id });
        allow = await ability.can('create', topic);
        assert.equal(true, allow);
        allow = await ability.can('read', topic);
        assert.equal(true, allow);
        allow = await ability.can('update', topic);
        assert.equal(true, allow);
        allow = await ability.can('destroy', topic);
        assert.equal(true, allow);
      });
    })
  });
});
```

## License

[MIT](LICENSE)
