const router = require('express').Router()

const Session = require('../models/session')

router.delete('/', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token missing or invalid' });
    }

    const token = authHeader.split(' ')[1]
    await Session.destroy({ where: { token } })

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

module.exports = router