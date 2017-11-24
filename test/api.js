'use strict'

const assert = require('assert'),
     request = require("request-promise")

const ROOT_URL = "http://localhost:3000"

require('../lib/config')(async function (){

  before(async () => {
    // app = require("../lib/app")
  })

  after(() => {
    // app.close()
  })

  describe('api', function (){
    it.skip("fuck", async function(){
      const r = await request({
        url: `${ROOT_URL}/api/task`,
        json: true,
      })

      assert(r.proxies.length > 10)
    })
  })
})
