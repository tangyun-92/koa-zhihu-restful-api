class HomeCtl {
  index(ctx) {
    ctx.body = '<h1>这是首页</h1>'
  }
}

module.exports = new HomeCtl()