'use strict'

function isSessionValid(session){
  return _.get(session, "id", 0) > 0
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
