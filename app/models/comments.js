const mongoose = require('mongoose')

const { Schema, model } = mongoose

const CommentSchema = new Schema({
  __v: { type: Number, select: false }, // select表示返回的json中隐藏__v
  content: { type: String, required: true },
  commentator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false,
  },
  questionId: { type: String, require: true },
  answerId: { type: String, require: true },
  rootCommentId: { type: String },
  replyTo: { type: Schema.Types.ObjectId, ref: 'User' }, // 回复给谁的
})

module.exports = model('Comment', CommentSchema)
