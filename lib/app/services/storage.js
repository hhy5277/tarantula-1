'use strict'

const Middleware = require("../utilities/middleware")

class Storage extends Middleware{
  readStream(){
    return this._execute.apply(this, ["readStream"].concat(_.values(arguments)))
  }

  read(){
    return this._execute.apply(this, ["read"].concat(_.values(arguments)))
  }

  write(){
    return this._execute.apply(this, ["write"].concat(_.values(arguments)))
  }
}

module.exports = Storage
