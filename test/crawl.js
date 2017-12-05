'use strict'

    const assert = require('assert'),
{ execFileSync } = require('child_process')

const execOption = {
  evn: process.env,
  maxBuffer: 1024 * 1024 * 20,
}

describe('crawl', function (){
  it("crawl page without javascript", async function(){
    this.timeout(1000 * 30)

    const r = execFileSync('./bin/tarantula', [
      "crawl",
      `${__dirname}/../examples/crawl_no_javascript.js`
    ], execOption)

    assert(JSON.parse(r).result.title.match(/百度/))
  })

  it("crawl image", async function(){
    this.timeout(1000 * 5)

    const r = execFileSync('./bin/tarantula', [
      `crawl`,
      `${__dirname}/../examples/crawl_image.js`
    ], execOption)

    assert(JSON.parse(r).result.image.length > 1024)
  })
})
