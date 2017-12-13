'use strict'

const md5 = require("./md5"),
       fs = require("fs"),
     path = require("path")

module.exports = () => {
  return {
    "tarantula-dispatch": md5(
      fs.readFileSync(path.resolve(`${__dirname}/../../../bin/tarantula-dispatch`), "utf-8")
    ),

    "tarantula-crawl": md5(
      fs.readFileSync(path.resolve(`${__dirname}/../../../bin/tarantula-crawl`), "utf-8")
    )
  }
}
