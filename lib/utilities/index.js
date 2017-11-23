'use strict'

function isProduction(){
  return process.env.NODE_ENV == 'production'
}

let baseName = ""
if (isProduction()){
  baseName = ""
}

if (typeof(global) != 'undefined'){
  global.BASE_NAME = baseName
}

if (typeof(moment) == 'undefined'){
  global.moment = require('moment')
}

module.exports = {
  isProduction: isProduction,  

  BASE_NAME: baseName,
}
