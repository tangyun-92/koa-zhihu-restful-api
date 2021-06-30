const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({ prefix: '/topics' })
const { checkTopicExist } = require('../controllers/users')
const {
  find,
  findById,
  create,
  update,
  listTopicFollowers,
  listQuestions,
} = require('../controllers/topics')

const { secret } = require('../config')

/**
 * 认证中间件
 */
const auth = jwt({ secret }) // 生成的用户信息在ctx.state上

router.get('/', find)
router.post('/', auth, create)
router.get('/:id', checkTopicExist, findById)
router.patch('/:id', auth, checkTopicExist, update)
router.get('/:id/followers', checkTopicExist, listTopicFollowers)
router.get('/:id/questions', checkTopicExist, listQuestions)

module.exports = router
