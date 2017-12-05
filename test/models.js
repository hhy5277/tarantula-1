'use strict'

const assert = require('assert')

describe('models', function (){
  before(async () => {

  })

  it("create sample project", async function(){
    const stats = await Stats.findAll({raw: true})

    await bluebird.resolve(Project.create({
      name: (Math.random() * 1000000).toFixed(1),
      description: "test",
      cron: (parseInt(Math.random() * 10) % 2) == 0 ? "0 10 * * * *" : null,
    })).then((project) => {
      return project.createScripts([{
        name: 'entry.js2',
        content: '----',
        isSeed: true,
      }, {
        name: 'test.js',
        content: '********',
      }]).return(project)
    }).then((project) => {
      return project.createSeedTask().then((s) => {
        return [
          s,
          Stats.findAll({raw: true})
        ]
      })
    }).spread((s, ss) => {
      const n = _.find(ss, (n) => n.scriptId == s.get().scriptId && moment(n.day).isSame(moment().startOf('day')))
      assert(n.undo == 1)
    })
  })

  it("get undo tasks", async function(){
    const stats = await Stats.findAll({raw: true})

    await bluebird.resolve(Project.getUndoTasks()).then((r) => {
      assert(r.tasks.length > 0)
      
      return [
        r.tasks,
        Stats.findAll({raw: true})
      ]
    }).spread((tasks, ss) => {
      return bluebird.map(tasks, (task) => {
        assert(task.md5.length > 0)

        return Task.findById(task.id).then(({ status }) => {
          assert(status == 'delivered')
        })
      })
    })
  })
})
