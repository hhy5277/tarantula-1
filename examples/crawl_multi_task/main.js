'use strict';

const config = {
  url: "https://www.v2ex.com",

  javascriptEnabled: false,
  //loadImages: false,
  //userAgent: "",
  //referer: "",

  // blockRequestReg: [],

  // mobileMode: false,
}

async function parser(buffer){
  const $ = require("cheerio").load(buffer.toString('utf-8'))

  const links = $("#Tabs a").map(function (){
    return {
      text: $(this).text(),
      link: $(this).attr("href"),
    }
  })

  return {
    tasks: _.chain(links).map((n) => {
      return {
        url: `https://www.v2ex.com${n.link}`,
        context: {node: n.text},
        scriptName: "fetch_items.js",
      }
    }).value()
  }
}

module.exports = {
  config,
  parser,
}
