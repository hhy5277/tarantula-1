'use strict'

if (typeof(_) === 'undefined'){
  global._ = require("lodash")
}

function randomStr(length){
  return _.chain([])
          .concat(_.range('0'.charCodeAt(), '9'.charCodeAt()))
          .concat(_.range('a'.charCodeAt(), 'z'.charCodeAt()))
          .concat(_.range('A'.charCodeAt(), 'Z'.charCodeAt()))
          .concat(['-'.charCodeAt(), '_'.charCodeAt()])
          .map(n => String.fromCharCode(n))
          .sampleSize(length).join("").value()
}

if (typeof(module) != 'undefined'){
  module.exports = randomStr
}
