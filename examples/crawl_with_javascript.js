'use strict';

const config = {
  url: "https://www.baidu.com/",
  //context: "",

  javascriptEnabled: true,
  //loadImages: false,
  //userAgent: "",

  // blockRequestReg: [],

  // mobileMode: false,
}

function parser(ctx){

  console.log("entry: " + JSON.stringify(ctx))

  if (ctx.step == 'waiting'){
    return ctx
  }else if (ctx.step == 'clicked'){
    const t = $("title").text()
    if (t == '关于百度'){
      //after click

      return {
        result: {
          title: t,
          currentUrl: window.location.href
        }
      }
    }
  }else{
    const el = $("a:contains('关于百度')")
    if (el.length == 0){
      //wait for next time.
      return {
        context: {
          step: 'waiting'
        }
      }
    }else{
      el[0].click()

      return {
        context: {
          step: 'clicked'
        }
      }
    }
  }
}

module.exports = {
  config,
  parser,
}
