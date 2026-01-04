const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { getStatistics } = require('../controllers/statisticsController')

router.get('/', authenticate, getStatistics)

module.exports = router



