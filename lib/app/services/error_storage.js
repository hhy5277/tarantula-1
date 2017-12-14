'use strict'

  const fs = require("fs"),
      path = require("path"),
{ mkdirsSync } = require("fs-extra"),
  readline = require('readline')


class ErrorStorage{
  static async getFilePath(script){
    const p = await script.getProject()

    const filePath = `${SETTINGS.error_storage_path}/${p.name}.log`
    mkdirsSync(path.dirname(filePath))

    return filePath
  }

  static write({script, content}){
    return Promise.resolve(FileStorage.getFilePath(script)).then((filePath) => {
      fs.writeFileSync(filePath, `${content}\n`, {encoding: null, flag: 'a'})
    })
  }

  static read({script, cb}){
    return Promise.resolve(FileStorage.getFilePath(script)).then((filePath) => {

      const src = fs.createReadStream(filePath)
      src.on("error", async (e) => {
        logger.error(e)

        await cb(null)
      })

      const d = readline.createInterface({
        input: src,
      })

      d.on("line", async (n) => {
        const r = await cb(n)

        if (!r){
          d.close()
        }
      })

      d.on("close", async (n) => {
        await cb(null)
      })

      d.on("error", async (e) => {
        logger.error(e)

        await cb(null)
      })
    })
  }
}

module.exports = ErrorStorage
