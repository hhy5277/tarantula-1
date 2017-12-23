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

    const filePath = `${SETTINGS.error_storage_path}/${p.name}.log`
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

  static read({script, cb}){
    return Promise.resolve(ErrorStorage.getFilePath(script)).then((filePath) => {
      if (!filePath){
        return
      }

      const stat = fs.statSync(filePath)
      const src = fs.createReadStream(filePath, {
        encoding: 'utf-8',
        start: _.max([stat.size - 1024 * 64, 0])
      })
      src.on("error", async (e) => {
        logger.error(e)

        await cb(null)
      })

      const d = readline.createInterface({
        input: src,
      })

      d.on("line", async (n) => {

        let parsed
        try{ parsed = JSON.parse(n) }catch(e){
          return
        }

        const r = await cb(parsed)

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
