const router = require('express').Router()

const { User, Blog, Readinglist } = require('../models')

const { Op } = require('sequelize')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exlude: ['userId'] }
    }
  })
  res.json(users)
})

router.get('/:id', async (req, res, next) => {
  try {
    const where = {}

    if (req.query.search === "true") {
      where.read = true
    }

    if (req.query.search === "false") {
      where.read = false
    }

    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Readinglist,
          attributes: ['id', 'read'],
          include: [
            {
              model: Blog, 
            },
          ],
          where
        },
      ]
      
    })
 
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch(error) {
    next(error)
  }
})

router.put('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { username: req.params.username } })
    if (!user) {
      const error = new Error('User not found')
      error.status = 404
      throw error
    }

    if (!req.body.name) {
      const error = new Error('New name not found')
      error.status = 404
      throw error
    }

    user.name = req.body.name
    await user.save()
    res.json(req.body)

  } catch (error) {
    next(error)
  }
})

module.exports = router