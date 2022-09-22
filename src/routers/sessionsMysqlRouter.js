const express = require('express')
const debug = require('debug')('app:sessionRouter-mysql')
const chalk = require('chalk')

const { getSessions, getOneSession } = require('../services/mysql.js')


const sessionMysqlRouter = express.Router()

sessionMysqlRouter.use((request, response, next) => {
    if (!request.user ) response.redirect('/auth/signIn')
    else if (request.user.db_type === 'mysql') next()
    else {
        debug(chalk.red('User not authorized to access MySQL'))
        response.redirect('/')
    }
})

sessionMysqlRouter.route('/').get(async (request, response) => {
    const sessions = await getSessions()
    if (sessions) response.render('sessions2', { sessions })
    else  response.redirect('/')
})

sessionMysqlRouter.route('/:id').get(async (request, response) => {
    const { id } = request.params
    const session = await getOneSession(id)
    if (session)  response.render('singleSession', { session })
    else  response.redirect('/sessions2')
})

module.exports = sessionMysqlRouter

