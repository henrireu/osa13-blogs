const router = require('express').Router()

const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')

const { Blog, User } = require('../models')

const { Op } = require('sequelize')
const { sequelize } = require('../util/db')

const tokenExtractor = (req, res, next) => {
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
}

const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    next()
}

router.get('/', async (req, res) => {
    const where = {}

    /*if (req.query.search) {
      where.title = {
        [Op.substring]: req.query.search
      }
    }*/

      if (req.query.search) {
        where[Op.or] = [
          { title: { [Op.substring]: req.query.search } },
          { author: { [Op.substring]: req.query.search } }
        ]
      }

    const blogs = await Blog.findAll({
      attributes: { exclude: ['userId'] },
      include: {
        model: User,
        attributes: ['name']
      },
      where,
      order: [['likes', 'DESC']]
    })
    res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res, next) => {
    try {
      const user = await User.findByPk(req.decodedToken.id)
      const blog = await Blog.create({...req.body, userId: user.id})
      res.json(blog) 
    } catch (error) {
        next(error)
    }
})

router.get('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
      res.json(req.blog)
    } else {
      res.status(404).end()
    }
})

router.delete('/:id', blogFinder, tokenExtractor, async (req, res) => {
  try {
    if (!req.blog) {
      return res.status(404).json({ error: 'Blog not found' })
    }

    const user = await User.findByPk(req.decodedToken.id)

    if (!user) {
      return res.status(401).json({ error: 'Invalid user' })
    }

    if (req.blog.userId === user.id) {
      await req.blog.destroy()
      return res.status(204).end()
    } else {
      return res.status(403).json({ error: 'Permission denied' })
    }
  } catch (error) {
    next(error)
  }
    /*if (req.blog) {
      const user = await User.findByPk(req.decodedToken.id)
      if(user.id === req.blog.user) {
        await req.blog.destroy()
      } else {
        res.status(204).end()
      }
    }
    res.status(204).end()*/
})

router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    if (!req.blog) {
      const error = new Error('Blog not found')
      error.status = 404
      throw error
    }

    if (!req.body.likes) {
      const error = new Error('Likes value is missing')
      error.status = 400
      throw error
    }

    req.blog.likes = req.blog.likes + 1
    await req.blog.save()
    res.json(req.blog)

  } catch (error) {
    next(error)
  }
})

module.exports = router