const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const TopicSchema = new Schema(
  {
    __v: { type: Number, select: false }, // select表示返回的json中隐藏__v
    name: { type: String, required: true },
    avatar_url: { type: String },
    introduction: { type: String, select: false },
  },
  { timestamps: true }
)

module.exports = model("Topic", TopicSchema);
