'use strict'

class Middleware{
  constructor(){
    this._list = []
  }

  use(func, ctx){
    this._list.push({func, ctx})
  }

  async execute(){
    return this._execute.apply(this, [null].concat(_.values(arguments)))
  }

  _execute(method){
    let i = 0;
    const next = async (err) => {
      if (err){
        throw err
      }

      if (i >= this._list.length){
        return
      }

      const argv = _.values(arguments).slice(1)
      if (method){
        return this._list[i++].func[method].apply(this, argv.concat([next]))
      }else{
        return this._list[i++].func.apply(this, argv.concat([next]))
      }
    }

    return next()
  }
}

module.exports = Middleware
