const express = require('express')
const debug = require('debug')('app:sessionRouter-mysql')
const chalk = require('chalk')

const { mySQL } = require('../services/mysql.js')
const speakerService = require('../services/speakerService.js')


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
    try {
        const connection = await mySQL
        debug(chalk.cyanBright('Connected to MySQL'))

        await connection.query('USE globomantics')
        const sessions = (await connection.execute('SELECT * FROM sessions'))[0]

        response.render('sessions2', { sessions })
    } catch (error) {
        debug(chalk.red(error.stack))
    }
})

sessionMysqlRouter.route('/:id').get(async (request, response) => {
    const { id } = request.params

    try {
        const connection = await mySQL
        debug(chalk.cyanBright('Connected to MySQL'))

        await connection.query('USE globomantics')
        const session = (await connection.query('SELECT * FROM sessions WHERE id=?', [id]))[0][0]
        const { data } = await speakerService.getSpeakerById(session.speakers[0].id)
        session.speaker = data

        response.render('singleSession', { session })
    } catch (error) {
        debug(chalk.red(error.stack))
    }
})

module.exports = sessionMysqlRouter

