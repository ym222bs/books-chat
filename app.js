const bodyParser = require('body-parser')
const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const validation = require('express-validator')
const helmet = require('helmet')
const mongoose = require('mongoose')
const socket = require('socket.io')
const path = require('path')
const app = express()

if (process.env.NODE_ENV !== 'production') require('dotenv').config()

app.use(express.static(path.join(__dirname, 'public')))
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(validation())
app.use(helmet())

app.use(
    session({
        key: 'user_id',
        secret: process.env.SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
)

const port = process.env.PORT || 8080

app.use((req, res, next) => {
    res.locals.session = req.session.user
    next()
})

// Logout destroys the session and clears the cookie.
app.use('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('user_id', { path: '/' }).redirect('/')
    })
})

app.use((req, res, next) => {
    if (req.session.flash) {
        res.locals.flash = req.session.flash
        // Delete it the flash from the session
        delete req.session.flash
    }
    next()
})

app.use('/', require('./routes/home'))
app.use('/', require('./routes/register'))
app.use('/', require('./routes/login'))

// Auth
app.use((req, res, next) => {
    if (req.session.user) {
        return next()
    } else {
        res.redirect('/login')
    }
})

const chatRoute = require('./routes/chatRoute')

app.use('/', require('./routes/userpage'))
app.use('/', chatRoute.router)

const uri = process.env.MLAB_MASTER_USER

mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
    })
    .then(() => {
        console.log('MongoDB Connected…')
    })
    .catch((err) => console.log(err))

const server = app.listen(port, () => {
    console.log(`Hello port ${port}.`)
})

const io = socket(server)
chatRoute.start(io)
