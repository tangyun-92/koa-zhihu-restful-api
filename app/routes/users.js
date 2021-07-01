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
  listLikingAnswers,
  likeAnswer,
  unlikeAnswer,
  listDislikingAnswers,
  dislikeAnswer,
  unDislikeAnswer,
  listCollectingAnswers,
  collectAnswer,
  unCollectAnswer,
} = require('../controllers/users')

const { checkAnswerExist } = require('../controllers/answers')

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
router.get('/:id/following', listFollowing)
router.get('/:id/followers', listFollowers)
router.put('/following/:id', auth, checkUserExist, follow)
router.delete('/following/:id', auth, checkUserExist, unFollow)
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)
router.delete('/followingTopics/:id', auth, checkTopicExist, unFollowTopic)
router.get('/:id/followingTopics', listFollowingTopics)
router.get('/:id/questions', listQuestions)
router.get('/:id/likingAnswers', listLikingAnswers)
// 每次赞答案的时候，取消踩
router.put(
  '/likingAnswers/:id',
  auth,
  checkAnswerExist,
  likeAnswer,
  unDislikeAnswer
)
router.delete('/likingAnswers/:id', auth, checkAnswerExist, unlikeAnswer)
router.get('/:id/dislikingAnswers', listDislikingAnswers)
// 每次踩答案的时候，取消赞
router.put(
  '/dislikingAnswers/:id',
  auth,
  checkAnswerExist,
  dislikeAnswer,
  unlikeAnswer
)
router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, unDislikeAnswer)
router.get('/:id/collectingAnswers', listCollectingAnswers)
router.put('/collectingAnswers/:id', auth, checkAnswerExist, collectAnswer)
router.delete('/collectingAnswers/:id', auth, checkAnswerExist, unCollectAnswer)

module.exports = router
