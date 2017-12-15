'use strict'

const zlib = require('zlib'),
        fs = require("fs"),
      path = require("path"),
{ mkdirsSync } = require("fs-extra"),
  readline = require('readline')

// class pipeFile{
//   constructor({ task, day }){
//     this.filePath;
//
//     this.task = task
//     this.day = day || moment().toDate()
//     this.cache = []
//   }
//
//   async getFilePath(){
//     if (this.filePath){
//       return this.filePath
//     }
//
//     const s = await this.task.getScript()
//     const p = await this.task.getProject()
//
//     this.filePath = `${SETTINGS.storage_path}/${moment(this.day).format("YYYYMMDD")}-${p.name}-${s.name}.txt.gz`
//     mkdirsSync(SETTINGS.storage_path)
//
//     return this.filePath
//   }
//
//   write(content){
//     return Promise.resolve(this.getFilePath()).then((filePath) => {
//       fs.writeFileSync(filePath, zlib.gzipSync(`${content}\n`), {encoding: null, flag: 'a'})
//     })
//   }
//
//   writeCache(content){
//     this.cache.push(content)
//   }
//
//   flush(){
//     return Promise.resolve(this.getFilePath()).then((filePath) => {
//       fs.writeFileSync(filePath, zlib.gzipSync(this.cache.join("\n")), {encoding: null, flag: 'a'})
//     })
//   }
//
//   read(cb){
//     return Promise.resolve(this.getFilePath()).then((filePath) => {
//       const d = readline.createInterface({
//         input: fs.createReadStream(filePath).pipe(zlib.createGunzip()),
//       })
//
//       d.on("line", async (n) => {
//         const r = await cb(n)
//
//         if (!r){
//           d.close()
//         }
//       })
//     })
//   }
// }

class FileStorage{
  static async getFilePath(script, day){
    const p = await script.getProject()

    const filePath = `${SETTINGS.storage_path}/${p.name}/${moment(day || Date.now()).format("YYYYMMDD")}-${script.name}.txt.gz`
    mkdirsSync(path.dirname(filePath))

    return filePath
  }

  static write({script, day, content}){
    return Promise.resolve(FileStorage.getFilePath(script, day)).then((filePath) => {
      fs.writeFileSync(filePath, zlib.gzipSync(`${content}\n`), {encoding: null, flag: 'a'})
    })
  }

  static read({script, day, cb}){
    return Promise.resolve(FileStorage.getFilePath(script, day)).then((filePath) => {

      const src = fs.createReadStream(filePath)
      src.on("error", async (e) => {
        logger.error(e)

        await cb(null)
      })

      const d = readline.createInterface({
        input: src.pipe(zlib.createGunzip()),
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

module.exports = FileStorage
