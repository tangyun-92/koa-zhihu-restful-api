const Answer = require('../models/answers')

class AnswersCtl {
  /**
   * 获取指定问题下的答案列表
   */
  async find(ctx) {
    const { per_page = 5 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q)
    ctx.body = await Answer.find({ content: q, questionId: ctx.params.questionId })
      .limit(perPage)
      .skip(page * perPage)
  }

  /**
   * 检查答案是否存在
   */
  async checkAnswerExist(ctx, next) {
    const answer = await Answer.findById(ctx.params.id).select('+answerer')
    if (!answer) {
      return ctx.throw(404, '答案不存在')
    }
    if (answer.questionId !== ctx.params.questionId) {
      return ctx.throw(404, '该问题下没有此答案')
    }
    ctx.state.answer = answer
    await next()
  }

  /**
   * 查询指定答案
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
    const answer = await Answer.findById(ctx.params.id)
      .select(selectFields)
      .populate('answerer')
    if (!answer) {
      ctx.throw(404, '问题不存在')
    }
    ctx.body = answer
  }

  /**
   * 创建答案
   */
  async create(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
    })
    const answer = await new Answer({
      ...ctx.request.body,
      answerer: ctx.state.user._id,
      questionId: ctx.params.questionId
    }).save()
    ctx.body = answer
  }

  /**
   * 检查回答者
   */
  async checkAnswerer(ctx, next) {
    const { answer } = ctx.state
    if (answer.answerer.toString() !== ctx.state.user._id) {
      return ctx.throw(403, '没有权限')
    }
    await next()
  }

  /**
   * 更新答案
   */
  async update(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: false },
    })
    await ctx.state.answer.updateOne(ctx.request.body)
    const newAnswer = await Answer.findById(ctx.params.id)
    ctx.body = newAnswer
  }

  /**
   * 删除答案
   */
  async delete(ctx) {
    await ctx.state.answer.remove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new AnswersCtl()
