'use strict';

const config = {
  url: "https://www.baidu.com/",

  javascriptEnabled: false,
  //loadImages: false,
  //userAgent: "",

  // blockRequestReg: [],

  // mobileMode: false,
}

async function parser(buffer){
  const $ = require("cheerio").load(buffer.toString('utf-8'))

  return {
    result: {
      title: $("title").text()      
    }
  }
}

module.exports = {
  config,
  parser,
}
