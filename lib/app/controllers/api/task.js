'use strict'

const router = require('koa-router')(),
    filesMD5 = require("../../utilities/script_md5")(),
{ HTTP_STATUS_CODE } = require("../../../utilities"),
{ verifyToken } = require("../../services/verify")

router.get("/", verifyToken, function* (){
  yield this.validateParams(
    {
      token: 'required',
      filesMD5: 'required',
    }
  )

  if (this.validationErrors){
    this.status = 500
    this.body = this.validationErrors
    return
  }

  if (!_.isEqual(filesMD5, this.params.filesMD5)){
    this.status = HTTP_STATUS_CODE.NEED_RESET_CLIENT
    return
  }

  try{
    this.body = {
      tasks: yield Project.getUndoTasks()
    }
  }catch(e){
    this.body = {
      status: 500,
      message: 'fetch tasks failed.'
    }
  }
})

module.exports = router
