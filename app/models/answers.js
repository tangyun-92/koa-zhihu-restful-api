const mongoose = require('mongoose')

const { Schema, model } = mongoose

const AnswerSchema = new Schema(
  {
    __v: { type: Number, select: false }, // select表示返回的json中隐藏__v
    content: { type: String, required: true },
    answerer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      select: false,
    },
    questionId: { type: String, require: true },
    voteCount: { type: Number, require: true, default: 0 }, // 投票数
  },
  { timestamps: true }
)

module.exports = model('Answer', AnswerSchema)
