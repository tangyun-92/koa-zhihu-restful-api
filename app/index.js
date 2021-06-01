const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const app = new Koa()
const routing = require('./routes')
const { connectionStr } = require('./config')

mongoose.connect(
  connectionStr,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log('MongoDB 连接成功了！')
)
mongoose.connection.on('error', console.error)

// 错误处理
app.use(
  error({
    postFormat: (err, { stack, ...rest }) =>
      process.env.NODE_ENV === 'production' ? rest : { stack, ...rest },
  })
)

app.use(bodyParser())
app.use(parameter(app))
routing(app)

app.listen(3003, () => {
  console.log('程序启动在3003端口了')
})
