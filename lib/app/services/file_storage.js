'use strict'

const zlib = require('zlib'),
        fs = require("fs"),
      path = require("path"),
{ mkdirsSync } = require("fs-extra"),
  readline = require('readline')


class FileStorage{
  static async getFilePath(script, day){
    const p = await script.getProject()

    const filePath = `${SETTINGS.storage_path}/${p.name}/${moment(day || Date.now()).startOf("hours").toDate() * 1}-${script.name}.txt.gz`
    mkdirsSync(path.dirname(filePath))

    return filePath
  }

  static write({script, day, content}){
    return Promise.resolve(FileStorage.getFilePath(script, day)).then((filePath) => {
      fs.writeFileSync(filePath, zlib.gzipSync(`${content}\n`), {encoding: null, flag: 'a'})
    })
  }

  static readStream({script, day}){
    return Promise.resolve(FileStorage.getFilePath(script, day)).then((filePath) => {
      if (!fs.existsSync(filePath)){
        return
      }

      return fs.createReadStream(filePath)
    })
  }

  static read({script, day}){
    return FileStorage.readStream({script, day}).then((src) => {
      if (!src){
        return
      }

      const d = readline.createInterface({
        input: src.pipe(zlib.createGunzip()),
      })

      src.on("error", async (e) => {
        d.close()
      })

      d.on("error", async (e) => {
        throw e
      })

      return d
    })

    return Promise.resolve(FileStorage.getFilePath(script, day)).then((filePath) => {
      if (!fs.existsSync(filePath)){
        return
      }

      const src = fs.createReadStream(filePath)

      const d = readline.createInterface({
        input: src.pipe(zlib.createGunzip()),
      })

      src.on("error", async (e) => {
        d.close()
      })

      /*
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
      */

      d.on("error", async (e) => {
        throw e
      })

      return d
    })
  }
}

module.exports = FileStorage
