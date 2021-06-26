const Topic = require("../models/topics");

class TopicsCtl {
  /**
   * 获取话题列表
   */
  async find(ctx) {
    ctx.body = await Topic.find();
  }

  /**
   * 查询指定话题
   */
  async findById(ctx) {
    const { fields } = ctx.query;
    const selectFields = fields
      .split(";")
      .filter((f) => f)
      .map((f) => " +" + f)
      .join("");
    const topic = await Topic.findById(ctx.params.id).select(selectFields);
    if (!topic) {
      ctx.throw(404, "话题不存在");
    }
    ctx.body = topic;
  }

  /**
   * 创建话题
   */
  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      avatar_url: { type: "string", required: false },
      introduction: { type: "string", required: false },
    });
    const topic = await new Topic(ctx.request.body).save();
    ctx.body = topic;
  }

  /**
   * 更新话题
   */
  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: false },
      avatar_url: { type: "string", required: false },
      introduction: { type: "string", required: false },
    });
    const topic = await Topic.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body
    );
    if (!topic) {
      ctx.throw(404, "话题不存在");
    }
    const newTopic = await Topic.findById(ctx.params.id);
    ctx.body = newTopic;
  }
}

module.exports = new TopicsCtl();
