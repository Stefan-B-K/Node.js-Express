const { MongoClient, ObjectId } = require('mongodb')
const sessions = require('../data/sessions.json')
const chalk = require('chalk')
const { mySQL } = require('./mysql.js')
const debug = require('debug')('app:mongo')


const mongoDB = new MongoClient(`mongodb://${process.env.HOST}:27017`, {
    auth: { username: process.env.USERNAME, password: process.env.PASSWORD }
})

const db = mongoDB.db('globomantics')
const sessionsCollection = db.collection('sessions');

(async function init () {
    try {
        await mongoDB.connect()
        debug(chalk.blue('Initial connection to MongoDB'))

        // check if collection doesn't exist    -->     upload json
        const data = await sessionsCollection.find().toArray()
        if (!data.length) {
            await sessionsCollection.insertMany(sessions)
            debug(chalk.blue('Initial json data uploaded to MongoDB'))
        }

    } catch (error) {
        debug(chalk.red('Error checking/uploading initial json data'))
    } finally {
        await mongoDB.close()
    }
}())

const existingUserMongo = async (username) => {
    try {
        await mongoDB.connect()
        debug(chalk.blue('Connected to MongoDB'))
        return await db.collection('users').findOne({ username })
    } catch (error) {
        debug(chalk.red(error.message))
        return {}
    }
}

const signUpWithMongoDB = async (user) => {
    try {
        await mongoDB.connect()
        debug(chalk.blue('Connected to MongoDB'))

        await db.collection('users').insertOne(user)
        debug(chalk.blue('User created'))
        return { OK: true, user }
    } catch (error) {
        debug(chalk.red(error.message))
        return { OK: false }
    }
}

module.exports = { mongoDB, db, sessionsCollection, ObjectId, existingUserMongo, signUpWithMongoDB }

