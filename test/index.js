'use strict'

    const assert = require('assert'),
{ execFileSync } = require('child_process')

const execOption = {
  evn: process.env,
  maxBuffer: 1024 * 1024 * 20,
}

require('../lib/config')(async function (){

  describe('crawl', function (){
    it("crawl page without javascript", async function(){
      this.timeout(1000 * 30)

      const r = execFileSync('node', [
        `${__dirname}/../bin/crawler.js`,
        `${__dirname}/../examples/crawl_no_javascript.js`
      ], execOption)

      assert(JSON.parse(r).result.title.match(/百度/))
    })

    it("crawl image", async function(){
      this.timeout(1000 * 5)

      const r = execFileSync('node', [
        `${__dirname}/../bin/crawler.js`,
        `${__dirname}/../examples/crawl_image.js`
      ], execOption)

      assert(JSON.parse(r).result.image.length > 1024)
    })
  })
})
