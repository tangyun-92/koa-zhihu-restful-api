const mongoose = require('mongoose')

const { Schema, model } = mongoose

const QuestionSchema = new Schema(
  {
    __v: { type: Number, select: false }, // select表示返回的json中隐藏__v
    title: { type: String, required: true },
    description: { type: String },
    questioner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      select: false,
    },
    topics: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
      select: false,
    },
  },
  { timestamps: true }
)

module.exports = model('Question', QuestionSchema)
