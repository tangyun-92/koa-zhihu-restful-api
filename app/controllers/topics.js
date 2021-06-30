const Topic = require('../models/topics')
const User = require('../models/users')
const Question = require('../models/questions')

class TopicsCtl {
  /**
   * 获取话题列表
   */
  async find(ctx) {
    const { per_page = 5 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, 1)
    ctx.body = await Topic.find({ name: new RegExp(ctx.query.q) })
      .limit(perPage)
      .skip(page * perPage)
  }

  /**
   * 查询指定话题
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
    const topic = await Topic.findById(ctx.params.id).select(selectFields)
    if (!topic) {
      ctx.throw(404, '话题不存在')
    }
    ctx.body = topic
  }

  /**
   * 创建话题
   */
  async create(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    })
    const topic = await new Topic(ctx.request.body).save()
    ctx.body = topic
  }

  /**
   * 更新话题
   */
  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false },
    })
    const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if (!topic) {
      ctx.throw(404, '话题不存在')
    }
    const newTopic = await Topic.findById(ctx.params.id)
    ctx.body = newTopic
  }

  /**
   * 话题关注者（粉丝）列表
   */
  async listTopicFollowers(ctx) {
    const users = await User.find({ followingTopics: ctx.params.id })
    ctx.body = users
  }

  /**
   * 话题下的问题列表
   */
  async listQuestions(ctx) {
    const questions = await Question.find({ topics: ctx.params.id })
    ctx.body = questions
  }
}

module.exports = new TopicsCtl()
