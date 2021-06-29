const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix: '/users' })
const {
  find,
  findById,
  create,
  update,
  delete: del,
  login,
  checkOwner,
  listFollowing,
  follow,
  unFollow,
  listFollowers,
  checkUserExist,
  followTopic,
  unFollowTopic,
  checkTopicExist,
  listFollowingTopics,
  listQuestions,
} = require('../controllers/users')

const { secret } = require('../config')

/**
 * 认证中间件
 */
const auth = jwt({ secret }) // 生成的用户信息在ctx.state上

router.get('/', find)
router.post('/', create)
router.get('/:id', findById)
router.patch('/:id', auth, checkOwner, update)
router.delete('/:id', auth, checkOwner, del)
router.post('/login', login)
router.get("/:id/following", listFollowing);
router.get("/:id/followers", listFollowers);
router.put("/following/:id", auth, checkUserExist, follow);
router.delete("/following/:id", auth, checkUserExist, unFollow);
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)
router.delete('/followingTopics/:id', auth, checkTopicExist, unFollowTopic)
router.get('/:id/followingTopics', listFollowingTopics)
router.get('/:id/questions', listQuestions)

module.exports = router
