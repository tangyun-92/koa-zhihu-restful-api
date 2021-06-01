const jsonwebtoken = require('jsonwebtoken')
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
} = require('../controllers/users')

const { secret } = require('../config')

/**
 * 认证中间件
 * @param {*} ctx 
 * @param {*} next 
 */
const auth = async (ctx, next) => {
  const { authorization = '' } = ctx.request.header
  const token = authorization.replace('Bearer ', '')
  try {
    const user = jsonwebtoken.verify(token, secret)
    ctx.state.user = user
  } catch (error) {
    ctx.throw(401, error.message)
  }
  await next()
}

router.get('/', find)

router.post('/', create)

router.get('/:id', findById)

router.patch('/:id', auth, checkOwner, update)

router.delete('/:id', auth, checkOwner, del)

router.post('/login', login)

module.exports = router
