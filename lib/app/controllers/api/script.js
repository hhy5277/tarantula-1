'use strict'

const router = require('koa-router')(),
{ verifyToken, verifySession } = require("../../services/verify")

router.get("/", verifySession, function* (){
  const r = yield Project.findAll({
    include: [Script],
    raw: true
  })

  this.body = {
    status: 0,
    scripts: _.chain(r).groupBy((n) => {
      return n.name
    }).reduce((rr, items, k) => {
      return _.merge(rr, {
        [k]: _.map(items, (n) => ({
          id: n['scripts.id'],
          name: n['scripts.name']
        }))
      })
    }, {}).value()
  }
})

router.get("/:scriptId/data_preview", verifySession, function* (){
  const s = yield Script.findById(this.params.scriptId)

  const days = _.range(moment(this.params.startDay).toDate() * 1, moment(this.params.endDay).endOf("day").toDate() * 1, 3600 * 1000).reverse()

  const data = []
  for (let n of days){
    if (data.length >= 20){
      break
    }

    const stream = yield s.loadResult(moment(n, "x"))
    if (stream){
      yield new Promise((resolve, reject) => {
        stream.on("line", (line) => {
          data.push(JSON.parse(line))
        })

        stream.on("close", () => {resolve()})
      })
    }
  }

  this.body = {
    status: 0,
    data
  }
})

router.get("/:scriptId/data_download", verifySession, function* (){
  const s = yield Script.findById(this.params.scriptId)

  const days = _.range(moment(this.params.startDay).toDate() * 1, moment(this.params.endDay).endOf("day").toDate() * 1, 3600 * 1000).reverse()

  const stream = yield s.loadResultStream(days)

  // this.set('Content-Encoding', "gzip")
  // this.set("Content-Type", "text/html; charset=utf-8")
  this.set("Content-Disposition", `attachment; filename=${s.name}-${this.params.startDay}_${this.params.endDay}.txt.gz`)

  // this.body = stream.pipe(z.createGunzip())
  this.body = stream
})

router.post("/get_code", verifyToken, function* (){
  this.body = yield bluebird.map(this.params.items, async (n) => {
    const r = await Script.findOne({
      where: {
        name: n.scriptName,
        md5: n.md5
      }
    })

    return _.merge({}, n, {
      code: _.get(r, "code")
    })
  })
})

module.exports = router
