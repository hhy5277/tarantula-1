'use strict';

const config = {
  url: "https://images10.newegg.com/WebResource/Themes/2005/Nest/logo_424x210.png",
}

async function parser(buffer, ctx){
  return {
    result: {
      image: buffer.toString("base64")
    }
  }
}

module.exports = {
  config,
  parser,
}
