const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10

const models = require('../models')

// GET gets all the blogs
router.get('/', (req, res, next) => {
<<<<<<< HEAD
    res.send("Welcome to the home page!`")
    console.log(req.session.teacher.teacherId)
    console.log(req.session.teacher.username)
=======
    res.render("homepage")
>>>>>>> master
})

router.get('/payment', (req, res, next) => {
    res.render('payment', {});
})

// POST the register information to database
router.get('/register', (req, res) => {
    res.render('register')
})

router.get('/register/teacher-register', (req, res) => {
    res.render('teacher-register')
})

router.post('/register/teacher-register', async (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let location = req.body.location
    let experience = req.body.experience
    let calendlyUrl = req.body.calendlyUrl

    let persistedUser = await models.Teacher.findOne({
        where: {
            username: username
        }
    })

    if (persistedUser == null) {
        bcrypt.hash(password, SALT_ROUNDS, async (error, hash) => {
            if (error) {
                res.render('teacher-register', { message: 'Error creating user' })
            } else {
                let teacher = models.Teacher.build({
                    username: username,
                    password: hash,
                    location: location,
                    yearsExperience: experience,
                    calendlyUrl: calendlyUrl
                })

                let savedTeacher = await teacher.save()
                if (savedTeacher != null) {
                    res.redirect('/login')
                } else {
                    res.render('teacher-register', { message: "User already exists" })
                }

            }
        })

    } else {
        res.render('teacher-register', { message: "User already exists" })
    }

})

// GET shows the login form
router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/login-teacher',(req,res) => {
    res.render('login-teacher')
})

router.post('/login-teacher', async (req,res) => {
    let username = req.body.username
    let password = req.body.password

    let teacher = await models.Teacher.findOne({
        where: {
            username:username
        }
    })

    if(teacher != null) {

        bcrypt.compare(password,teacher.password,(error,result) => {
            if(result) {
                //create session
                if(req.session) {
                    req.session.teacher = {
                        teacherId: teacher.id,
                        username: teacher.username
                    }

                    res.redirect('/')
                }
            } else {
                res.render('login-teacher',{message:'Incorrect username or password'})
            }
        })
    } else { //if the user is null
        res.render('login-teacher',{message:'Incorrect username or password'})
    }

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