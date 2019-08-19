const express = require("express")
const app = express()
const path = require('path')
const mustacheExpress = require("mustache-express")
const VIEWS_PATH = path.join(__dirname, '/views')
const singlyRouter = require('./routes/singly')

app.engine("mustache", mustacheExpress(VIEWS_PATH + '/partials', '.mustache'))
app.set("views", VIEWS_PATH)
app.set("view engine", "mustache")
app.use(express.urlencoded({ extended: false }))
app.use("/css", express.static(__dirname + '/css'))
app.use('/', singlyRouter)


app.listen(3000, () => {
    console.log("Hey the server is running...")
})