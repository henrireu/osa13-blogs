const router = require('express').Router()

const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')

const { User, Blog, Readinglist, Session } = require('../models')

/*const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      console.log(authorization.substring(7))
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch (error){
      console.log(error)
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}*/

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const token = authorization.substring(7)

    try {
      const decodedToken = jwt.verify(token, process.env.SECRET)
      console.log('Token decoded:', decodedToken)

      const session = await Session.findOne({ where: { token } })
      if (!session) {
        return res.status(401).json({ error: 'Session invalid or expired' })
      }

      const user = await User.findByPk(decodedToken.id)
      if (!user || user.disabled) {
        return res.status(401).json({ error: 'User disabled or not found' })
      }

      req.user = user
      req.session = session
      req.decodedToken = decodedToken
    } catch (error) {
      console.error('Token verification error:', error)
      return res.status(401).json({ error: 'Token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'Token missing' })
  }

  next()
}

router.post('/', async (req, res, next) => {
  try {
    const reading = await Readinglist.create(req.body)
    res.json(reading)
  } catch (error) {
    next(error)
  }
}) 

router.put('/:id', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)

    const reading = await Readinglist.findByPk(req.params.id)

    if (user.id !== reading.userId) {
      const error = new Error('User is not authorized for this')
      error.status = 404
      throw error
    }

    if (req.body.read === undefined) {
      const error = new Error('Missing content')
      error.status = 404
      throw error
    }

    reading.read = req.body.read
    await reading.save()
    res.json(reading)

    /*if (user.id === reading.userId) {
      if (req.body.read) {
        reading.read = req.body.read
        await reading.save()
        res.json(reading)
      }
    }*/

  } catch (error) {
    next(error)
  }
})

module.exports = router 