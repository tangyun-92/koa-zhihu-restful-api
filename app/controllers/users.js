const User = require('../models/users')

class UsersCtl {
  // 查询所有用户
  async find(ctx) {
    ctx.body = await User.find()
  }
  // 查询特定用户
  async findById(ctx) {
    const user = await User.findById(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }
  // 新建用户
  async create(ctx) {
    ctx.verifyParams({
      name: { type: 'string', require: true },
      password: { type: 'string', require: true },
    })
    const { name } = ctx.request.body
    const repeatedUser = await User.findOne({ name })
    if (repeatedUser) {
      ctx.throw(409, '用户已经存在')
    }
    const user = await new User(ctx.request.body).save()
    ctx.body = user
  }
  // 更新用户
  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', require: false },
      password: { type: 'string', require: false },
    })
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    const newUser = await User.findById(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = newUser
  }
  // 删除用户
  async delete(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.status = 204
  }
}

module.exports = new UsersCtl()
