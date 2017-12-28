'use strict'

  const fs = require("fs"),
      path = require("path"),
{ mkdirsSync } = require("fs-extra"),
  readline = require('readline')


class ErrorStorage{
  static async getFilePath(script){
    if (_.isEmpty(SETTINGS.error_storage_path || "")){
      return
    }

    const p = await script.getProject()

    const filePath = `${SETTINGS.error_storage_path}/${p.id}-${p.name}.log`
    mkdirsSync(path.dirname(filePath))

    return filePath
  }

  static write({script, content}){
    return Promise.resolve(ErrorStorage.getFilePath(script)).then((filePath) => {
      if (filePath){
        fs.writeFileSync(filePath, `${content}\n`, {encoding: 'utf-8', flag: 'a'})
      }
    })
  }

  static read({script}){
    return Promise.resolve(ErrorStorage.getFilePath(script)).then((filePath) => {
      if (!filePath){
        return
      }

      if (!fs.existsSync(filePath)){
        return
      }

      const stat = fs.statSync(filePath)
      const src = fs.createReadStream(filePath, {
        encoding: 'utf-8',
        start: _.max([stat.size - 1024 * 64, 0])
      })

      const d = readline.createInterface({
        input: src,
      })

      src.on("error", async (e) => {
        d.close()
      })

      return d
    })
  }
}

module.exports = ErrorStorage
