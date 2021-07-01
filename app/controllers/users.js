const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const Topic = require('../models/topics')
const Question = require('../models/questions')
const Answer = require('../models/answers')
const { secret } = require('../config')

class UsersCtl {
  /**
   * 查询所有用户
   */
  async find(ctx) {
    const { per_page = 5 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, 1)
    ctx.body = await User.find({ name: new RegExp(ctx.query.q) })
      .limit(perPage)
      .skip(page * perPage)
  }

  /**
   * 查询特定用户
   */
  async findById(ctx) {
    const { fields } = ctx.query
    const selectFields =
      fields &&
      fields
        .split(';')
        .filter((f) => f)
        .map((f) => ' +' + f)
        .join('')
    const populateStr =
      fields &&
      fields
        .split(';')
        .filter((f) => f)
        .map((f) => {
          if (f === 'employments') {
            return 'employments.company employments.job'
          }
          if (f === 'educations') {
            return 'educations.school educations.major'
          }
          return f
        })
        .join(' ')
    const user = await User.findById(ctx.params.id)
      .select(selectFields)
      .populate(populateStr)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user
  }

  /**
   * 新建用户
   */
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

  /**
   * 判断是否有权限的中间件
   */
  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.throw(403, '没有权限')
    }
    await next()
  }

  /**
   * 更新用户
   */
  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', require: false },
      password: { type: 'string', require: false },
      avatar_url: { type: 'string', required: false },
      gender: { type: 'string', required: false },
      headline: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false },
      educations: { type: 'array', itemType: 'object', required: false },
    })
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    const newUser = await User.findById(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = newUser
  }

  /**
   * 删除用户
   */
  async delete(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.status = 204
  }

  /**
   * 登录
   */
  async login(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: { type: 'string', required: true },
    })
    const user = await User.findOne(ctx.request.body)
    if (!user) {
      ctx.throw(401, '用户名或密码不正确')
    }
    const { _id, name } = user
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' })
    ctx.body = { token }
  }

  /**
   * 获取用户关注的用户列表
   */
  async listFollowing(ctx) {
    const user = await User.findById(ctx.params.id)
      .select('+following')
      .populate('following')
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user.following
  }

  /**
   * 获取粉丝列表
   */
  async listFollowers(ctx) {
    const users = await User.find({ following: ctx.params.id })
    ctx.body = users
  }

  /**
   * 判断用户存在与否
   */
  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    await next()
  }

  /**
   * 关注某个用户
   */
  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    if (!me.following.map((id) => id.toString()).includes(ctx.params.id)) {
      me.following.push(ctx.params.id)
      me.save()
    } else {
      ctx.throw(404, '您已关注过该用户')
    }
    ctx.status = 204
  }

  /**
   * 取消关注某人
   */
  async unFollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+following')
    const index = me.following.map((id) => id.toString()).indexOf(ctx.params.id)
    if (index > -1) {
      me.following.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  /**
   * 检查话题是否存在
   */
  async checkTopicExist(ctx, next) {
    const topic = await Topic.findById(ctx.params.id)
    if (!topic) {
      return ctx.throw(404, '话题不存在')
    }
    await next()
  }

  /**
   * 获取用户关注的话题列表
   */
  async listFollowingTopics(ctx) {
    const user = await User.findById(ctx.params.id)
      .select('+followingTopics')
      .populate('followingTopics')
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user.followingTopics
  }

  /**
   * 关注话题
   */
  async followTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select(
      '+followingTopics'
    )
    if (
      !me.followingTopics.map((id) => id.toString()).includes(ctx.params.id)
    ) {
      me.followingTopics.push(ctx.params.id)
      me.save()
    } else {
      ctx.throw(404, '您已经关注过该话题了')
    }
    ctx.status = 204
  }

  /**
   * 取消关注话题
   */
  async unFollowTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select(
      '+followingTopics'
    )
    const index = me.followingTopics
      .map((id) => id.toString())
      .indexOf(ctx.params.id)
    if (index > -1) {
      me.followingTopics.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  /**
   * 用户的提问列表
   */
  async listQuestions(ctx) {
    const questions = await Question.find({ questioner: ctx.params.id })
    ctx.body = questions
  }

  /**
   * 获取用户赞过的答案列表
   */
  async listLikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id)
      .select('+likingAnswers')
      .populate('likingAnswers')
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user.likingAnswers
  }

  /**
   * 点赞答案
   */
  async likeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    if (!me.likingAnswers.map((id) => id.toString()).includes(ctx.params.id)) {
      me.likingAnswers.push(ctx.params.id)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
    } else {
      ctx.throw(404, '您已经赞过该答案了')
    }
    ctx.status = 204
    await next()
  }

  /**
   * 取消赞答案
   */
  async unlikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
    const index = me.likingAnswers
      .map((id) => id.toString())
      .indexOf(ctx.params.id)
    if (index > -1) {
      me.likingAnswers.splice(index, 1)
      me.save()
      await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })
    }
    ctx.status = 204
  }

  /**
   * 获取用户踩过的答案列表
   */
  async listDislikingAnswers(ctx) {
    const user = await User.findById(ctx.params.id)
      .select('+dislikingAnswers')
      .populate('dislikingAnswers')
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user.dislikingAnswers
  }

  /**
   * 踩答案
   */
  async dislikeAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select(
      '+dislikingAnswers'
    )
    if (
      !me.dislikingAnswers.map((id) => id.toString()).includes(ctx.params.id)
    ) {
      me.dislikingAnswers.push(ctx.params.id)
      me.save()
    } else {
      ctx.throw(404, '您已经踩过该答案了')
    }
    ctx.status = 204
    await next()
  }

  /**
   * 取消踩答案
   */
  async unDislikeAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select(
      '+dislikingAnswers'
    )
    const index = me.dislikingAnswers
      .map((id) => id.toString())
      .indexOf(ctx.params.id)
    if (index > -1) {
      me.dislikingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }

  /**
   * 获取用户收藏的答案列表
   */
  async listCollectingAnswers(ctx) {
    const user = await User.findById(ctx.params.id)
      .select('+collectingAnswers')
      .populate('collectingAnswers')
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    ctx.body = user.collectingAnswers
  }

  /**
   * 收藏答案
   */
  async collectAnswer(ctx, next) {
    const me = await User.findById(ctx.state.user._id).select(
      '+collectingAnswers'
    )
    if (
      !me.collectingAnswers.map((id) => id.toString()).includes(ctx.params.id)
    ) {
      me.collectingAnswers.push(ctx.params.id)
      me.save()
    } else {
      ctx.throw(404, '您已经收藏过该答案了')
    }
    ctx.status = 204
    await next()
  }

  /**
   * 取消收藏答案
   */
  async unCollectAnswer(ctx) {
    const me = await User.findById(ctx.state.user._id).select(
      '+collectingAnswers'
    )
    const index = me.collectingAnswers
      .map((id) => id.toString())
      .indexOf(ctx.params.id)
    if (index > -1) {
      me.collectingAnswers.splice(index, 1)
      me.save()
    }
    ctx.status = 204
  }
}

module.exports = new UsersCtl()
