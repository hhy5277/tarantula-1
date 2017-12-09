'use strict'

global._ = require('lodash')

global.SETTINGS = require(process.env["TARANTULA_CONFIG"] || "../../config/tarantula-config.json")
global.SETTINGS = _.merge({}, SETTINGS['default'], SETTINGS[process.env['NODE_ENV'] || "development"])

global.isProduction = process.env.NODE_ENV == 'production'
