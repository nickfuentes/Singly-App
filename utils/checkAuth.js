function checkAuth(req, res, next) {

    if (req.session) {

        if (req.session.user) {
            res.locals.authenticated = true
            next()
        } else {
            res.redirect("/login")
        }

    } else {
        res.redirect("/login")
    }

}

module.exports = checkAuth