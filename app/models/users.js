const mongoose = require('mongoose')

const { Schema, model } = mongoose

const userSchema = new Schema(
  {
    __v: { type: Number, select: false }, // select表示返回的json中隐藏__v
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    avatar_url: { type: String },
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: 'male',
      required: true,
    }, // enum表示枚举值
    headline: { type: String }, // 一句话介绍自己
    locations: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
      select: false,
    }, // 居住地
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      select: false,
    }, // 行业
    employments: {
      type: [
        {
          company: { type: Schema.Types.ObjectId, ref: 'Topic' },
          job: { type: Schema.Types.ObjectId, ref: 'Topic' },
        },
      ],
      select: false,
    }, // 职业经历
    educations: {
      type: [
        {
          school: { type: Schema.Types.ObjectId, ref: 'Topic' },
          major: { type: Schema.Types.ObjectId, ref: 'Topic' }, // 专业
          diploma: { type: Number, enum: [1, 2, 3, 4, 5] }, // 学历
          entrance_year: { type: Number }, // 入学年份
          graduation_year: { type: Number }, // 毕业年份
        },
      ],
      select: false,
    },
    following: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      select: false,
    }, // 关注的人
    followingTopics: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
      select: false,
    }, // 关注的话题
    likingAnswers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
      select: false,
    }, // 赞过的答案
    dislikingAnswers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
      select: false,
    }, // 踩过的答案
    collectingAnswers: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
      select: false,
    }, // 收藏的答案
  },
  { timestamps: true }
)

module.exports = model('User', userSchema)
