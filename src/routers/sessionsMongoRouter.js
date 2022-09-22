const express = require('express')
const debug = require('debug')('app:sessionRouter-mongo')
const chalk = require('chalk')

const { getSessions, getOneSession } = require('../services/mongo.js')


const sessionsMongoRouter = express.Router()

sessionsMongoRouter.use((request, response, next) => {
    if (!request.user) response.redirect('/auth/signIn')
    else if (request.user.database === 'mongodb') next()
    else {
        debug(chalk.red('User not authorized to access MongoDB'))
        response.redirect('/')
    }
})

sessionsMongoRouter.route('/').get(async (request, response) => {
    const sessions = await getSessions()
    if (sessions) response.render('sessions1', { sessions })
    else  response.redirect('/')
})

sessionsMongoRouter.route('/:id').get(async (request, response) => {
    const { id } = request.params
    const session = await getOneSession(id)
    if(session)  response.render('singleSession', { session })
    else  response.redirect('/sessions1')
})

module.exports = sessionsMongoRouter

