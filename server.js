const express = require('express')
const chalk = require('chalk')                                // color
const debug = require('debug')('app')
const morgan = require('morgan')                         //  HTTP request logger
const path = require('path')
require('dotenv').config()

const sessionsMongoRouter = require('./src/routers/sessionsMongoRouter.js')
const sessionsMysqlRouter = require('./src/routers/sessionsMysqlRouter.js')
const authRouter = require('./src/routers/authRouter.js')


const app = express()

app.use(morgan('tiny'))                 // 'combined'
app.use(express.static(path.join(__dirname, '/public/')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


require('./src/config/passport.js')(app)

app.set('views', './src/views')
app.set('view engine', 'ejs')

app.get('/', (request, response) => {
    response.render('index', { title: 'Globomantics' })
})

app.use('/sessions1', sessionsMongoRouter)
app.use('/sessions2', sessionsMysqlRouter)
app.use('/auth', authRouter)

app.listen(3003, () => debug(chalk.greenBright('Running EXPRESS on port 3003...')))