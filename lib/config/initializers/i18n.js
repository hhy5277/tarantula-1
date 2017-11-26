'use strict';

const locale = require('koa-locale'), //  detect the locale
        i18n = require('koa-i18n')

locale(app)

app.use(i18n(app, {
  directory: `${__dirname}/../locales`,
  extension: ".json",
  locales: ['zh-CN', 'en'], //  `zh-CN` defualtLocale, must match the locales to the filenames
  modes: [
    'query',                //  optional detect querystring - `/?locale=en-US`
    // 'subdomain',            //  optional detect subdomain   - `zh-CN.koajs.com`
    // 'cookie',               //  optional detect cookie      - `Cookie: locale=zh-TW`
    'header',               //  optional detect header      - `Accept-Language: zh-CN,zh;q=0.5`
    // 'url',                  //  optional detect url         - `/en`
    // 'tld',                  //  optional detect tld(the last domain) - `koajs.cn`
    // function() {}           //  optional custom function (will be bound to the koa context)
  ]
}))
