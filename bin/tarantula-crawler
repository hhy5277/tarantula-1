#!/usr/bin/env node

'use strict'

// var ua = require('universal-analytics');
// var visitor = ua('UA-5836737-13');
// visitor.set("an", "uWall")
// visitor.pageview("/fuck").send()

const program = require("commander"),
      request = require("request-promise"),
requireString = require('require-from-string'),
      phantom = require('phantom'),
        async = require("async"),
           fs = require('fs')


global._ = require("lodash")

const debug = {
  info: require("debug")("craw:info"),
  warn: require("debug")("craw:warn"),
  error: require("debug")("craw:error"),
}

program
  .option('--url <url>', "fetch the url")
  .option('--context <context>', "the context json as string", "{}")
  .parse(process.argv)

// var socks = require('socksv5');
//
// var srv = socks.createServer(function(info, accept, deny) {
//   console.log(info)
//   accept();
// });
// srv.listen(1080, 'localhost', function() {
//   console.log('SOCKS server listening on port 1080');
// });
// srv.useAuth(socks.auth.None());

const external = ((scriptFile) => {
  if (scriptFile){
    debug.info(`load script file: ${program.args[0]}`)
    return require(program.args[0])
  }

  process.stdin.setEncoding('utf8');
  return requireString(fs.readFileSync(process.stdin.fd).toString())
})(program.args[0])

const url = program.url || external.config.url
const context = JSON.parse(program.context)

debug.info(`url: ${url}`)
debug.info(`context: ${JSON.stringify(context)}`)

const UAs = [
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36",
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36 SE 2.X MetaSr 1.0",
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36",
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36 LBBROWSER",
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 UBrowser/5.2.2466.104 Safari/537.36",
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36",
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36",
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36 SE 2.X MetaSr 1.0",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36 SE 2.X MetaSr 1.0",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36 SE 2.X MetaSr 1.0",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122 BIDUBrowser/7.5 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36 LBBROWSER",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.132 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36",
]

const MOBILE_UAs = [
  "Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Mobile Safari/537.36"
]

;(async function() {
  if (!external.config.javascriptEnabled){
    let r = await request({
      url: external.config.url,
      headers: {
        "User-Agent": _.sample(UAs),
        // "Referer": referer
      },
      encoding: null
    })

    if (external.parser){
      r = await external.parser(r)
    }

    console.log(JSON.stringify(r, null, 2))
  }else{
    //"--proxy-type=socks5", "--proxy=127.0.0.1:1080"
    const instance = await phantom.create([], {
      // logLevel: _.isEmpty(process.env.DEBUG) ? "none" : "info",
      logger: {
        warn: require("debug")("phantom:warn"),
        debug: require("debug")("phantom:debug"),
        error: require("debug")("phantom:error"),
        info: require("debug")("phantom:info"),
      }
    })
    const page = await instance.createPage()

    _.chain(external).get("config", {}).pick([
      "javascriptEnabled",
      "loadImages",
      "userAgent",
    ]).thru((c) => {
      return {
        javascriptEnabled: c.javascriptEnabled || false,
        userAgent: c.userAgent || (external.config.mobileMode ? _.sample(MOBILE_UAs) : _.sample(UAs)),
        loadImages: c.loadImages || false,
      }
    }).forEach((v, k) => {
      debug.info(`page setting: ${k} - ${v}`)
      page.setting(k, v)
    }).value()

    debug.info(`mobile mode: ${external.config.mobileMode == true}`)
    if (external.config.mobileMode){
      page.property('viewportSize', {width: 800, height: 600})
    }else{
      page.property('viewportSize', {width: 1440, height: 900})
    }

    // await external.parser()
    // debug.info(eval(external.parser).toString())
    // process.exit()

    await page.on('onResourceRequested', true, function(requestData, networkRequest, blockList) {

      var isAbort = blockList.filter(function(n){
        return new RegExp(n).test(requestData.url)
      }).length > 0

      if (isAbort){
        console.warn("abort url:", requestData.url)
        networkRequest.abort()
        return
      }

      console.log("request: ", requestData.url)
    }, _.chain(external.config).get("blockRequestReg", [
      "google|gstatic|doubleclick",
      "\\.(woff|ttf|svg)\\??",
    ]).value())

    // await page.on('onResourceReceived', true, function(responseData) {});
    await page.on("onConsoleMessage", function(message){
      debug.info("console message: ", message)
    })

    debug.info(`open url: ${url}`)
    await page.open(url)

    const ctx = _.clone(context)
    async.retry({
      times: 20 || Number.MAX_VALUE,
      interval: 500,
    }, async () => {
      debug.info(`confirm jquery.`)
      const isJquery = await page.evaluate(function() {
        return typeof($$) == 'function'
      })

      if (!isJquery){
        debug.info(`inject jquery.`)
        await page.injectJs(require.resolve('jquery/dist/jquery.min.js'))
        await page.evaluate(function() {
          $$ = $.noConflict()
        })
      }

      debug.info(`evaluate parser`)
      const r = await page.evaluate(external.parser, ctx)
      if (r.context){
        _.merge(ctx, r.context)
      }

      if (r.result){
        return r
      }

      throw new Error("retry evaluate.")
    }, (err, result) => {
      if (err){
        debug.error(err)
      }

      console.log(JSON.stringify(result, null, 2))
      instance.exit();
    })

    // const content = await page.property('content');
    // console.log(content);
  }
})();
