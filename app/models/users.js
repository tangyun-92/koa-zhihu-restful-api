const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  __v: { type: Number, select: false }, // select表示返回的json中隐藏__v
  name: { type: String, required: true },
  password: { type: String, required: true, select: false },
  avatar_url: { type: String },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male",
    required: true,
  }, // enum表示枚举值
  headline: { type: String }, // 一句话介绍自己
  locations: { type: [{ type: String }], select: false }, // 居住地
  business: { type: String, select: false }, // 行业
  employments: {
    type: [
      {
        company: { type: String },
        job: { type: String },
      },
    ],
    select: false,
  }, // 职业经历
  educations: {
    type: [
      {
        school: { type: String },
        major: { type: String }, // 专业
        diploma: { type: Number, enum: [1, 2, 3, 4, 5] }, // 学历
        entrance_year: { type: Number }, // 入学年份
        graduation_year: { type: Number }, // 毕业年份
      },
    ],
    select: false,
  },
  following: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    select: false
  }, // 关注的人
});

module.exports = model("User", userSchema);
