'use strict'

const program = require('commander')

require('./config')

program
  .option('-c, --console', "start app with console")
  .option('-p, --port <n>', "listen port", 3000)
  .option('--cron', "start app with cron")
  .parse(process.argv)

if (program.console){
  logger.info("console started.")

  require('repl').start({prompt: '> ', useGlobal: true, terminal: true})
  _ = require("lodash")     //Expression assignment to _ now disabled.  for repl
}else if (program.cron){
  require('require-dir-all')('./cron')
}else{
  logger.info("server started.")  

  app.listen(program.port)
}

logger.info(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
