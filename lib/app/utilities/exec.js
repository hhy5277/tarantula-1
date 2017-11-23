'use strict'

const { spawn } = require('child_process')

module.exports = function (){
  return new Promise((resolve, reject) => {
    const proc = spawn.apply(this, arguments)
    proc.stdout.pipe(process.stdout)

    proc.on("close", (code) => {
      resolve()
    })

    proc.on("error", (e) => {
      reject(e)
    })
  })
}
