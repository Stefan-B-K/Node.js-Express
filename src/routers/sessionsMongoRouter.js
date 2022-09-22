const express = require('express')
const debug = require('debug')('app:sessionRouter-mongo')
const chalk = require('chalk')

const { mongoDB, sessionsCollection, ObjectId } = require('../services/mongo.js')
const speakerService = require('../services/speakerService.js')


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
    try {
        await mongoDB.connect()
        debug(chalk.blue('Connected to MongoDB'))

        const sessions = await sessionsCollection.find().toArray()
        response.render('sessions1', { sessions })

    } catch (error) {
        debug(chalk.red(error.stack))
    } finally {
        await mongoDB.close()
        debug(chalk.blue('Connection to MongoDB closed'))
    }
})

sessionsMongoRouter.route('/:id').get(async (request, response) => {
    const { id } = request.params

    try {
        await mongoDB.connect()
        debug(chalk.blue('Connected to MongoDB'))

        const session = await sessionsCollection.findOne({ _id: new ObjectId(id) })
        const { data } = await speakerService.getSpeakerById(session.speakers[0].id)        // speakerService
        session.speaker = data

        response.render('singleSession', { session })

    } catch (error) {
        debug(chalk.red(error.stack))
    } finally {
        await mongoDB.close()
        debug(chalk.blue('Connection to MongoDB closed'))
    }
})

module.exports = sessionsMongoRouter

