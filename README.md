# egg-egg-cancan

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-egg-cancan.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-egg-cancan
[travis-image]: https://img.shields.io/travis/eggjs/egg-egg-cancan.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-egg-cancan
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-egg-cancan.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-egg-cancan?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-egg-cancan.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-egg-cancan
[snyk-image]: https://snyk.io/test/npm/egg-egg-cancan/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-egg-cancan
[download-image]: https://img.shields.io/npm/dm/egg-egg-cancan.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-egg-cancan

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

  async can(action, type, obj) {
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

## License

[MIT](LICENSE)
