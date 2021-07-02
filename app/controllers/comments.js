const Comment = require('../models/comments')

class CommentsCtl {
  /**
   * 获取指定问题下的评论列表
   */
  async find(ctx) {
    const { per_page = 5 } = ctx.query
    const page = Math.max(ctx.query.page * 1, 1) - 1
    const perPage = Math.max(per_page * 1, 1)
    const q = new RegExp(ctx.query.q)
    const { questionId, answerId } = ctx.params
    const { rootCommentId } = ctx.query
    ctx.body = await Comment.find({
      content: q,
      questionId,
      answerId,
      rootCommentId,
    })
      .limit(perPage)
      .skip(page * perPage)
      .populate('commentator replyTo')
  }

  /**
   * 检查评论是否存在
   */
  async checkCommentExist(ctx, next) {
    const comment = await Comment.findById(ctx.params.id).select('+commentator')
    if (!comment) {
      return ctx.throw(404, '评论不存在')
    }
    // 只有当删改查评论时，才检查，赞和踩评论不检查
    if (ctx.params.questionId && comment.questionId !== ctx.params.questionId) {
      return ctx.throw(404, '该问题下没有此评论')
    }
    if (ctx.params.answerId && comment.answerId !== ctx.params.answerId) {
      return ctx.throw(404, '该答案下没有此评论')
    }
    ctx.state.comment = comment
    await next()
  }

  /**
   * 查询指定评论
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
    const comment = await Comment.findById(ctx.params.id)
      .select(selectFields)
      .populate('commentator')
    if (!comment) {
      ctx.throw(404, '评论不存在')
    }
    ctx.body = comment
  }

  /**
   * 创建评论
   */
  async create(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
      rootCommentId: { type: 'string', required: false },
      replyTo: { type: 'string', required: false },
    })
    const { questionId, answerId } = ctx.params
    const comment = await new Comment({
      ...ctx.request.body,
      commentator: ctx.state.user._id,
      questionId,
      answerId,
    }).save()
    ctx.body = comment
  }

  /**
   * 检查评论人
   */
  async checkCommentator(ctx, next) {
    const { comment } = ctx.state
    if (comment.commentator.toString() !== ctx.state.user._id) {
      return ctx.throw(403, '没有权限')
    }
    await next()
  }

  /**
   * 更新评论
   */
  async update(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: false },
    })
    // 只允许更新 content 属性
    const { content } = ctx.request.body
    await ctx.state.comment.updateOne({ content })
    const newComment = await Comment.findById(ctx.params.id)
    ctx.body = newComment
  }

  /**
   * 删除评论
   */
  async delete(ctx) {
    await ctx.state.comment.remove(ctx.params.id)
    ctx.status = 204
  }
}

module.exports = new CommentsCtl()
