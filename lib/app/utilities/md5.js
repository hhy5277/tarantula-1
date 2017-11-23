'use strict'

const crypto = require('crypto')

module.exports = (v) => {
  return crypto.createHash('md5').update(v).digest('hex');
}
