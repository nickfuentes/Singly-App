const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10
const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage(
  {
      destination: function (req, file, cb) {
          cb(null, __dirname + '/../uploads/images')
        },
      filename: function ( req, file, cb ) {
          cb( null, req.body.username + '-' + Date.now() + '-' + file.originalname)
      }
  }
);
const upload = multer({storage: storage})

const models = require('../models')

// GET Pulls up the home page
router.get('/', (req, res) => {
    res.render('homepage')
})

// Adding a route to the video conferencing

router.get('/video-conference', (req,res) => {
    let roomId = req.query.roomId
    let peerName = req.query.userId
    res.render("video-conference", {roomId: roomId, peerName: peerName})
    
    // add a button <a href='/video-conference/roomId={{roomId}}&userid={{userId}}'></a>
  
})

// GET Pulls the payment view 
router.get('/payment', (req, res) => {
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
    let rate = req.body.rate
    let bio = req.body.bio
    let fullBio = req.body.fullBio
    let genre1 = req.body.genre1
    let genre2 = req.body.genre2
    let genre3 = req.body.genre3
    
    let imageurl = path.join(__dirname + '/../uploads/images/' + req.file.filename) 
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
                    calendlyUrl: calendlyUrl,
                    bio: bio,
                    rate: rate,
                    fullBio: fullBio,
                    imageurl: path.join(__dirname + '/../uploads/images/' + req.file.filename),
                    calendlyUrl: calendlyUrl
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