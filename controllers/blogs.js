const router = require('express').Router()

const { Blog } = require('../models')

const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    next()
}

router.get('/', async (req, res) => {
    const blogs = await Blog.findAll()
    res.json(blogs)
})

router.post('/', async (req, res, next) => {
    try {
        const blog = await Blog.create(req.body)
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

router.delete('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
      await req.blog.destroy()
    }
    res.status(204).end()
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