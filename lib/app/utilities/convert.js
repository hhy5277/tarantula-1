'use strict'

module.exports = {
  human: (n) => {
    if (Number(n) < 1024){
      return `${n} B`
    }else if (Number(n) < 1024 * 1024){
      return `${(n / 1024).toFixed(2)} KB`
    }else if (Number(n) < 1024 * 1024 * 1024){
      return `${(n / 1024 / 1024).toFixed(2)} MB`
    }else if (Number(n) < 1024 * 1024 * 1024 * 1024){
      return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
    }
  },

  ratio: (v1, v2) => {
    return (Number(v1) / Number(v2) * 100).toFixed(2)
  }
}
