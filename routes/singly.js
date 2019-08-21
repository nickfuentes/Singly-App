const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10

const models = require('../models')

// GET Pulls up the home page
router.get('/', (req, res) => {
    console.log(req.session.teacher.teacherId)
    console.log(req.session.teacher.username)
    res.render('homepage')
})

// GET Pulls the payment view 
router.get('/payment', (req, res) => {
    res.render('payment');
})

// POST the register information to database
router.get('/register', (req, res) => {
    res.render('register')
})

// GET Pulls the view of the login-user from
router.get('/login', (req, res) => {
    res.render('login')
})

// GET Pulls the view for the teacher-register form
router.get('/register/teacher-register', (req, res) => {
    res.render('teacher-register')
})

//POST Puts the teacher into the database
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
                    res.redirect('/login-teacher')
                } else {
                    res.render('teacher-register', { message: "User already exists" })
                }

            }
        })

    } else {
        res.render('teacher-register', { message: "User already exists" })
    }

})

// GET Pulls the view of the login-teacher form
router.get('/login-teacher', (req, res) => {
    res.render('login-teacher')
})

// POST Logs the teacher in to home page
router.post('/login-teacher', async (req, res) => {
    let username = req.body.username
    let password = req.body.password

    let teacher = await models.Teacher.findOne({
        where: {
            username: username
        }
    })

    if (teacher != null) {

        bcrypt.compare(password, teacher.password, (error, result) => {
            if (result) {
                //create session
                if (req.session) {
                    req.session.teacher = {
                        teacherId: teacher.id,
                        username: teacher.username
                    }
                    res.redirect('/')
                }
            } else {
                res.render('login-teacher', { message: 'Incorrect username or password' })
            }
        })
    } else { //if the user is null
        res.render('login-teacher', { message: 'Incorrect username or password' })
    }

})

module.exports = router