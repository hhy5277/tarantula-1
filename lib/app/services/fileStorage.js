'use strict'

const zlib = require('zlib'),
        fs = require("fs"),
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
  static async getFilePath(task, day){
    const s = await task.getScript()
    const p = await task.getProject()

    const filePath = `${SETTINGS.storage_path}/${moment(day).format("YYYYMMDD")}-${p.name}-${s.name}.txt.gz`
    mkdirsSync(SETTINGS.storage_path)

    return filePath
  }

  static write({task, day, content}){
    return Promise.resolve(this.getFilePath(task, day)).then((filePath) => {
      fs.writeFileSync(filePath, zlib.gzipSync(`${content}\n`), {encoding: null, flag: 'a'})
    })
  }

  static read({task, day, cb}){
    return Promise.resolve(this.getFilePath(task, day)).then((filePath) => {
      const d = readline.createInterface({
        input: fs.createReadStream(filePath).pipe(zlib.createGunzip()),
      })

      d.on("line", async (n) => {
        const r = await cb(n)

        if (!r){
          d.close()
        }
      })
    })
  }
}

module.exports = FileStorage
