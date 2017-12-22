'use strict'

const { mkdirsSync } = require("fs-extra"),
                  fs = require('fs'),
                path = require('path')

module.exports = () => {
  const fullPath = `${require('os').homedir()}/.config/tarantula/config.json`

  try{
    return require(fullPath).uuid
  }catch(e){
    const uuid = require('uuid/v4')()

    mkdirsSync(path.dirname(fullPath))

    fs.writeFileSync(fullPath, JSON.stringify({
      uuid: uuid
    }, null, 2), 'utf-8')

    return uuid
  }
}
