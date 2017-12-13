'use strict'

const { HTTP_STATUS_CODE } = require("../../utilities"),
                  statuses = require('statuses')

_.each(HTTP_STATUS_CODE, (v, k) => {
  statuses[v] = k
})
