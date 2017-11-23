'use strict'

require("../../utilities")

global._ = require('lodash')
global.co = require('co')

global.async = require('async')

global.SETTINGS = {
  development: {
  },

  production: {
  },

  defaults: {
  }
}

SETTINGS = _.merge({}, SETTINGS['defaults'], SETTINGS[process.env['NODE_ENV'] || "development"])
