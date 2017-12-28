'use strict';

const config = {

  javascriptEnabled: false,
  //loadImages: false,
  //userAgent: "",
  //referer: "",

  // blockRequestReg: [],

  // mobileMode: false,
}

async function parser(buffer, ctx){
  const $ = require("cheerio").load(buffer.toString('utf-8'))

  const r = []
  $(".box .item").each(function(n){
    r.push({
      title: $(this).find(".item_title").text(),
      author: $(this).find(".small.fade strong").first().find("a").text(),
      author_url: $(this).find(".small.fade strong").first().find("a").attr("href"),
      node: $(this).find(".node").text(),
    })
  })

  return {
    result: {
      nodeName: ctx.nodeName,
      items: r
    }
  }
}

module.exports = {
  config,
  parser,
}
