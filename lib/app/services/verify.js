'use strict'

module.exports = {
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

    if (_.isEmpty(_.get(this, "session.id" ,""))){
      this.throw(401)
    }

    return yield next
  }
}
