'use strict'

const assert = require('assert')

describe('model', function (){
  before(() => {

  })

  it("create sample project", async function(){
    await bluebird.resolve(Project.create({
      name: (Math.random() * 1000000).toFixed(1),
      description: "test"
      // seedScriptId: DataTypes.INTEGER,
      // description: DataTypes.STRING,
      // cron: DataTypes.STRING,
    })).then((project) => {
      return project.createScripts([{
        name: 'entry.js2',
        content: '----',
        isSeed: true,
      }])
    })
  })

  it("create seed task", async function(){
    await bluebird.resolve(Project.findOne({
      where: {seedScriptId: {$ne: null}}
    })).then((project) => {
      assert(project)
    })
  })

  it("get undo tasks", async function(){
    await bluebird.resolve(Project.getUndoTasks()).then((r) => {
      assert(r.tasks.length > 0)
    })
  })
})
