'use strict'

async function isSessionValid(session){
  return !_.isEmpty(_.get(session, "id" ,""))
}

module.exports = {
  isSessionValid,

  verifyToken: function* (next){
    if (SETTINGS.token != this.token){
      this.throw(401)
    }

    return yield next
  },

  verifySession: function* (next){
    if (!isProduction){
      return yield next
    }

    if (!isSessionValid(this.session)){
      this.throw(401)
    }

    return yield next
  },
}
