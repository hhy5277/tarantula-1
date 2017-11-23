const staticCache = require('koa-static-cache')

app.use(staticCache(`${__dirname}/../../public`, {
  //prefix: BASE_NAME
  dynamic: true
}))
