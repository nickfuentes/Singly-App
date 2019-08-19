const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10
const session = require('express-session')

// GET gets all the blogs
router.get('/', (req,res,next) => {
    res.send("Welcome to the home page!`")
})

router.get('/payment', (req, res, next) => {
        res.render('index', { });
})

// POST the register information to database
router.get('/register', (req, res) => {
    res.render('register')
})

// POST the user username and password to users database with bcrypt
router.post('/register', (req, res) => {

    let username = req.body.username
    let password = req.body.password

    db.oneOrNone('SELECT userid FROM users WHERE username = $1', [username])
        .then((user) => {
            if (user) {
                res.render('register', { message: "User name already exists!" })
            } else {
                bcrypt.hash(password, SALT_ROUNDS).then(function (hash) {
                    db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, hash])
                        .then(() => {
                            res.redirect('/login')
                        })
                })
            }
        })
})

// GET shows the login form
router.get('/login', (req, res) => {
    res.render('login')
})

// POST logins user to app
router.post('/login', (req, res) => {

    let username = req.body.username
    let password = req.body.password

    db.oneOrNone('SELECT userid, username, password FROM users WHERE username = $1', [username])
        .then((user) => {
            if (user) {
                bcrypt.compare(password, user.password).then(function (result) {
                    if (result) {
                        if (req.session) {
                            req.session.user = {
                                userid: user.userid,
                                username: user.username
                            }
                        }
                        res.redirect('/my-blogs')
                    } else {
                        res.send('render the same page and tell the user that credentials are wrong')
                    }
                })
            } else {
                res.render('login', { message: "Invalid username or password!" })
            }
        })
})


module.exports = router