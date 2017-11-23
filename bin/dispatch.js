#!/usr/bin/env node

'ues strict'

const DEBUG = process.env.DEBUG == 'true'

const request = require('request-promise'),
            _ = require('lodash'),
        async = require('async'),
      program = require('commander'),
{ execFile, execSync, execFileSync } = require('child_process'),
         zlib = require('zlib')

const logger = {
  info: require("debug")("dispatch:info"),
  warn: require("debug")("dispatch:warn"),
  error: require("debug")("dispatch:error"),
}

const ROOT_URL = DEBUG ? 'http://lvh.me:3003' : 'http://spider.fishtrip.cn',
     TASK_PATH = `${ROOT_URL}/api/task`,
   RESULT_PATH = `${ROOT_URL}/api/result`,
    PROXY_PATH = `${ROOT_URL}/api/proxy`,


  const TIME_SLEEP = 1000 * 60 * 10,
OUTPUT_BUFFER_SIZE = 1024 * 1024 * 20,
   PROCESS_TIMEOUT = 1000 * 60 * 2,
       MAX_PROCESS = 5

program
  .option('--max-process <n>', "max process number", MAX_PROCESS, parseInt)
  .parse(process.argv)


;function killProcessTree(){
  if (DEBUG){
    return
  }

  try{
    execSync(`pgrep -P ${process.pid} -t "?"`).toString().match(/\d+/g).forEach((pid) => {
      execSync(`kill ${pid}`)
    })
  }catch(e){}
}

;function nextLoop(fun, t){
  request({
    method: 'get',
    url: RESET_PATH,
  }).then((n) => {
    const res = JSON.parse(n)
    if (res.resetTag){
      process.exit()
    } else{
      setTimeout(fun, t)
    }
  }).catch(e){
    setTimeout(fun, t)
  }
}

;function clean(){
  if (DEBUG){
    return
  }

  logger.info('clean.')

  const commands = [
    'rm -rf xvfb-run.* > /dev/null 2>&1',
    'rm -rf /tmp/slimerjs.* > /dev/null 2>&1',
    'rm -rf /tmp/xvfb-run.* > /dev/null 2>&1',
    'rm -rf /tmp/.X*-lock > /dev/null 2>&1',
    'rm -rf /tmp/.X11-unix/* > /dev/null 2>&1',
    `rm -rf "${__dirname}/core."* > /dev/null 2>&1`,
  ]

  _.each(commands, (n) => execSync(n))
}

;(async function main(){
  co(function* (){
    logger.info(`let's play.`)

    clean()

    const outputBuffer = {
      results: [],
      tasks: [],
    }

    const proxies = yield request({
      url: PROXY_PATH,
      json: true,
    })

    const category = program.normal ? 'normal' : 'webkit'

    const tasks = _.chain(yield request({
      url: TASK_PATH,
      form: {category: category, started_time: STARTED_TIME},
      json: true,
    })).thru((items) => {
      if (DEBUG){
        return _.sampleSize(items, 5)
      }

      return items
    }).value()

    return new Promise((resolve, reject) => {
      async.mapLimit(tasks, program.maxProcess, (task, next) => {
        let ctx
        try{ ctx = JSON.parse(task.context) }catch(e){}

        const isWebkit = task.category == 'webkit'
        const forceProxy = _.get(ctx, 'force_proxy')
        const disableProxy = _.get(ctx, 'disable_proxy')
        const processTimeout = _.get(ctx, 'wait_timeout', PROCESS_TIMEOUT)

        const runCommand = isWebkit ? 'xvfb-run' : task.script_name
        let runParams = []
        if (isWebkit){
          runParams = runParams.concat(['-a', task.script_name])
        }

        runParams.push(task.url)
        if (task.context){
          runParams.push(task.context)
        }

        if (isWebkit){
          runParams.push('--engine=slimerjs')
        }

        const env = _.merge({}, process.env, {dayu_ua: _.sample(UA)}, ctx || {})
        const proxy = _.chain(proxies).sample().value()

        if ((Number(task.attempts) == 0 && !disableProxy && proxy) || (forceProxy && proxy)){
          _.merge(env, {
            http_proxy: `${proxy.proxy_type}://${proxy.ip}:${proxy.port}`,
            https_proxy: `${proxy.proxy_type}://${proxy.ip}:${proxy.port}`,
          })
        }

        co(function* (){
          const stdout = yield new Promise((resolve, reject) => {
            execFile(runCommand, runParams, {
              env: env,
              maxBuffer: OUTPUT_BUFFER_SIZE,
              timeout: Number(processTimeout),
              //killSignal: 'SIGINT',     //SIGKILL
            }, (error, stdout, stderr) => {
              if (error){
                reject(error)
                return
              }

              resolve(stdout)
            })
          })

          const taskResult = JSON.parse(stdout)

          if (Number(taskResult.status) != 200){
            throw taskResult.status
          }

          const r = _.chain(taskResult.task || taskResult.tasks || []).map((n) => {
            n.context = _.isObject(n.context) ? JSON.stringify(n.context) : n.context

            return {
              task_id: task.id,
              task: n
            }
          }).thru((n) => {
            return n.concat([{
              task_id: task.id,
              result: taskResult['result']
            }])
          }).value()

          next(null, r)
        }).catch((e) => {
          if (task.attempts >= 3){
            logger.error(`${runCommand} ${runParams} message: ${e}`)
          }else{
            logger.warn(`${runCommand} ${runParams} message: ${e}`)
          }

          killProcessTree()

          next(null, [{
            task_id: task.id,
            message: e || "error"
          }])
        })
      }, (error, result) => {
        if (error){
          return reject(error)
        }

        resolve(result)
      })
    })
  }).then((result) => {
    if (_.isNil(result) || _.isEmpty(result)){
      logger.info(`got nothing.`)
      setTimeout(main, TIME_SLEEP)
      return
    }

    if (DEBUG){
      logger.info(JSON.stringify(result, null, 2))
    }

    const headers = { "content-type": "application/json" }
    let sendBuffer = JSON.stringify({results: result})
    if (sendBuffer.length > 1024){
      _.merge(headers, {
        "content-type": "gzip/json"
      })

      sendBuffer = zlib.gzipSync(sendBuffer)
    }

    logger.info(`send data to server. ${sendBuffer.length}`)

    async.retry(10, (done) => {
      request({
        method: 'post',
        url: RESULT_PATH,
        headers: headers,
        body: sendBuffer,
      }).then(() => done()).catch(done)
    }, (error, r) => {
      if (error){
        logger.error(error)
        nextLoop(main, TIME_SLEEP)
        return
      }

      nextLoop(main, 0)
    })
  }).catch((e) => {
    logger.error(e)
    logger.info(`sleep ${TIME_SLEEP / 1000}s`)

    nextLoop(main, TIME_SLEEP)
  })
})()
