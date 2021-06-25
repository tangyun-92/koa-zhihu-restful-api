const Koa = require('koa')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const path = require('path')
const app = new Koa()
const routing = require('./routes')
const { connectionStr } = require('./config')

mongoose.connect(
  connectionStr,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log('MongoDB 连接成功了！')
)
mongoose.connection.on('error', console.error)

// 指定静态文件目录中间件
app.use(koaStatic(path.join(__dirname, 'public')));
// 错误处理
app.use(
  error({
    postFormat: (err, { stack, ...rest }) =>
      process.env.NODE_ENV === 'production' ? rest : { stack, ...rest },
  })
)

app.use(
  koaBody({
    multipart: true, // 表示启用文件，可以上传文件
    formidable: {
      uploadDir: path.join(__dirname, '/public/uploads'), // 上传目录
      keepExtensions: true, // 保留扩展名
    },
  })
);
app.use(parameter(app))
routing(app)

app.listen(3003, () => {
  console.log('程序启动在3003端口了')
})
