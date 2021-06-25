const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/users");
const { secret } = require("../config");

class UsersCtl {
  /**
   * 查询所有用户
   * @param {*} ctx
   */
  async find(ctx) {
    ctx.body = await User.find();
  }

  /**
   * 查询特定用户
   * @param {*} ctx
   */
  async findById(ctx) {
    const { fields } = ctx.query;
    const selectFields = fields
      .split(";")
      .filter((f) => f)
      .map((f) => " +" + f)
      .join("");
    const user = await User.findById(ctx.params.id).select(selectFields);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = user;
  }

  /**
   * 新建用户
   * @param {*} ctx
   */
  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", require: true },
      password: { type: "string", require: true },
    });
    const { name } = ctx.request.body;
    const repeatedUser = await User.findOne({ name });
    if (repeatedUser) {
      ctx.throw(409, "用户已经存在");
    }
    const user = await new User(ctx.request.body).save();
    ctx.body = user;
  }

  /**
   * 判断是否有权限的中间件
   * @param {*} ctx
   * @param {*} next
   */
  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, "没有权限");
    }
    await next();
  }

  /**
   * 更新用户
   * @param {*} ctx
   */
  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", require: false },
      password: { type: "string", require: false },
      avatar_url: { type: "string", required: false },
      gender: { type: "string", required: false },
      headline: { type: "string", required: false },
      locations: { type: "array", itemType: "string", required: false },
      business: { type: "string", required: false },
      employments: { type: "array", itemType: "object", required: false },
      educations: { type: "array", itemType: "object", required: false },
    });
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    const newUser = await User.findById(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = newUser;
  }

  /**
   * 删除用户
   * @param {*} ctx
   */
  async delete(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.status = 204;
  }

  /**
   * 登录
   * @param {*} ctx
   */
  async login(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      password: { type: "string", required: true },
    });
    const user = await User.findOne(ctx.request.body);
    if (!user) {
      ctx.throw(401, "用户名或密码不正确");
    }
    const { _id, name } = user;
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: "1d" });
    ctx.body = { token };
  }
}

module.exports = new UsersCtl();
