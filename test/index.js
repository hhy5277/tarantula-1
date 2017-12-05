'use strict'

const assert = require('assert')

let exitCode = 0

before(() => {
  require('../lib/config')
})

after(() => {
  setTimeout(() => {
    process.exit(exitCode)
  }, 1000)
})

afterEach(function() {
  if (this.currentTest.state === 'failed') {
    exitCode = 1
  }
})
