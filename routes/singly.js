const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10
const multer = require('multer')
const path = require('path')
const checkAuth = require("../utils/checkAuth")
const storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            cb(null, __dirname + '/../uploads/images')
        },
        filename: function (req, file, cb) {
            cb(null, req.body.username + '-' + Date.now() + '-' + file.originalname)
        }
    }
);
const upload = multer({ storage: storage })

const models = require('../models')

const Op = require('Sequelize').Op;

// Authinticated local to hide links if user is not logged in
router.use((req, res, next) => {
    res.locals.authenticated = req.session.user == null ? false : true
    next()
})

// GET Pulls up the home page
router.get('/', (req, res) => {

    models.Teacher.findAll({
        include: [{
            model: models.Genre,
            as: 'genres'
        }]
    })
        .then(teachers => {
            console.log(teachers)
            res.render('homepage', { teachers: teachers })
        })

    // models.Teacher.findAll()
    //     .then(teachers => {
    //         res.render('homepage', { teachers: teachers })
    //     })
})

// GET Adding a route to the video conferencing
router.get('/video-conference', checkAuth, (req, res) => {

    res.render("video-conference")

})

// GET Pulls the payment view 
router.get('/payment', checkAuth, (req, res) => {
    res.render('payment');
})

// POST Pulls the view for the register page
router.get('/register', (req, res) => {
    res.render('register')
})

//POST Puts the user into the database
router.post('/register', async (req, res) => {
    let username = req.body.username
    let password = req.body.password

    let persistedUser = await models.User.findOne({
        where: {
            username: username
        }
    })

    if (persistedUser == null) {
        bcrypt.hash(password, SALT_ROUNDS, async (error, hash) => {
            if (error) {
                res.render('register', { message: 'Error creating user' })
            } else {
                let user = models.User.build({
                    username: username,
                    password: hash
                })

                let savedUser = await user.save()
                if (savedUser != null) {
                    res.redirect('/login')
                } else {
                    res.render('register', { message: "User already exists" })
                }

            }
        })

    } else {
        res.render('register', { message: "User already exists" })
    }

})

// GET Pulls the view of the login-user form
router.get('/login', (req, res) => {
    res.render('login')
})

// POST Logs the user into home page
router.post('/login', async (req, res) => {
    let username = req.body.username
    let password = req.body.password

    let user = await models.User.findOne({
        where: {
            username: username
        }
    })

    if (user != null) {

        bcrypt.compare(password, user.password, (error, result) => {
            if (result) {
                //create session
                if (req.session) {
                    req.session.user = {
                        userId: user.id,
                        username: user.username
                    }
                    res.redirect('/')
                }
            } else {
                res.render('login', { message: 'Incorrect username or password' })
            }
        })
    } else { //if the user is null
        res.render('login', { message: 'Incorrect username or password' })
    }

})

// GET Pulls the view for the teacher-register form
router.get('/register/teacher-register', (req, res) => {
    res.render('teacher-register')
})

//POST Puts the teacher into the database
router.post('/register/teacher-register', upload.single('photo'), async (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let location = req.body.location
    let experience = req.body.experience
    let calendlyUrl = req.body.calendlyUrl
    let imageurl = path.join('/../uploads/images/' + req.file.filename)
    let rate = req.body.rate
    let bio = req.body.bio
    let fullBio = req.body.fullBio
    let genre1 = req.body.genre1
    let genre2 = req.body.genre2
    let genre3 = req.body.genre3

    /*if(req.file) {
        imageurl = req.file.filename
    }*/
    console.log("First console log in POST teacher reg", imageurl)
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
                    imageurl: path.join('/../uploads/images/' + req.file.filename),
                    calendlyUrl: calendlyUrl,
                    bio: bio,
                    rate: rate,
                    fullBio: fullBio
                })


                let savedTeacher = await teacher.save()
                    .then((savedTeacher) => {
                        savedTeacher.id
                        let genre = models.Genre.build({
                            teacherId: savedTeacher.id,
                            name: genre1,
                            name2: genre2,
                            name3: genre3
                        })
                        genre.save()
                        return savedTeacher
                    })
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

// POST Logs the teacher into home page
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
                    req.session.user = {
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

//GET Search Pulls teacher profile based off name
router.post("/search-teacher", (req, res) => {

    let teacherName = req.body.teacherName
    console.log(teacherName)

    models.Teacher.findOne({
        include: [{
            model: models.Genre,
            as: 'genres'
        }],
        where: {
            username: teacherName
        }
    })
        .then(teacher => {
            console.log(teacher)
            res.render('teacher-search', { teacher })
        })
})

//GET Search Pulls teacher profile based off genre
router.post("/genre-search", (req, res) => {

    let genre = req.body.genre
    console.log(genre)

    models.Teacher.findAll({
        include: [{
            model: models.Genre,
            as: 'genres',
            where: {
                [Op.or]: [{ name: genre }, { name2: genre }, { name3: genre },]
            }
        }]
    })
        .then(teachers => {
            console.log(teachers)
            res.render('genre-search', { teachers: teachers })
        })
})

//GET Pulls the teacher profile view
router.get("/teacher-profile/:teacherid", checkAuth, (req, res) => {

    let teacherid = req.params.teacherid

    let usernamesess = req.session.user.username

    models.Teacher.findOne({
        include: [{
            model: models.Genre,
            as: 'genres'
        }],
        where: {
            id: teacherid
        }
    })
        .then(teacher => {
            res.render('teacher-profile', { teacher, usernamesess: usernamesess })
        })
})

// POST updates the user blog by blogid
router.get('/logout', (req, res, next) => {

    if (req.session) {
        req.session.destroy((error) => {
            if (error) {
                next(error)
            } else {
                res.redirect('/login')
            }
        })
    }
})

module.exports = router