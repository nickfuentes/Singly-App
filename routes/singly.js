const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10
const session = require('express-session')

// GET gets all the blogs
router.get('/', (req, res) => {
    res.send("Testing!")
})

module.exports = router