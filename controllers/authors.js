const router = require('express').Router()
const { Blog } = require('../models')
const { Sequelize } = require('sequelize') 

router.get('/', async (req, res) => {
  try {
    const authors = await Blog.findAll({
      attributes: [
        'author', 
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'blogs'], 
        [Sequelize.fn('SUM', Sequelize.col('likes')), 'likes'] 
      ],
      group: ['author'], 
      order: [[Sequelize.fn('SUM', Sequelize.col('likes')), 'DESC']]
    })

    res.json(authors)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

module.exports = router