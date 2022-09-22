const mysql = require('mysql2/promise')
const chalk = require('chalk')
const debug = require('debug')('app:mysql')
const sessions = require('../data/sessions.json')
const { mongoDB, db } = require('./mongo.js')

const keys = Object.keys(sessions[0]).map(key => key.toString())

const values = sessions.map(item => {
    return Object.values(item)
        .map(value => {
            if (typeof value === 'object') return JSON.stringify(value)
            return value
        })
})

const mySQL = async function init () {
    const connection = await mysql.createConnection({
        host: process.env.HOST,
        user: process.env.USERNAME,
        password: process.env.PASSWORD
    })
    debug(chalk.cyanBright('Initial connection to MySQL'))

    try {
        const responseDb = await connection.query('CREATE DATABASE IF NOT EXISTS globomantics')
        if (!responseDb[0].warningStatus) debug(chalk.cyanBright('MySQL database "globomantics" created'))

        await connection.query('USE globomantics')
        const sessionsFields = 'id int, title varchar(100), description text, startsAt varchar(5), endsAt varchar(5), speakers json, room varchar(20), day varchar(20), format varchar(50), track varchar(20), level varchar(50)'
        const createSessions = `CREATE TABLE IF NOT EXISTS sessions (${ sessionsFields })`
        const responseSessions = await connection.query(createSessions)
        if (!responseSessions[0].warningStatus) {
            debug(chalk.cyanBright('MySQL table "sessions" created'))
            const insertJSON = `INSERT INTO sessions (${keys}) VALUES  ?`
            await connection.query(insertJSON, [values])
            debug(chalk.cyanBright(('Initial json data uploaded to MySQL')))
        }

        const usersFields = 'id int primary key auto_increment, username varchar(20) not null, password varchar(30) not null, db_type varchar(10) not null'
        const createUsers = `CREATE TABLE IF NOT EXISTS users (${ usersFields })`
        const responseUsers = await connection.query(createUsers)
        if (!responseUsers[0].warningStatus) debug(chalk.cyanBright('MySQL table "users" created'))

    } catch (error) {
        debug(chalk.red(error.message))
    }

    return connection
}()

const existingUserMySQL = async (username) => {
    try {
        const connection = await mySQL
        debug(chalk.cyanBright('Connected to MySQL'))
        await connection.query('USE globomantics')
        return (await connection.query('SELECT * FROM users WHERE username=?', [username]))[0][0]
    } catch (error) {
        debug(chalk.red(error.message))
        return {}
    }
}

const signUpWithMySQL = async (user) => {
    const { username, password, database } = user

    try {
        const connection = await mySQL
        debug(chalk.cyanBright('Connected to MySQL'))

        await connection.query('USE globomantics')
        const insertUser = 'INSERT INTO users (`username`, `password`, `db_type`) VALUES (?, ?, ?)'
        const result = (await connection.query(insertUser, [username, password, database]))[0]
        debug(chalk.blue('User created'))
        return { OK: true, user: { ...user, id: result.insertId } }
    } catch (error) {
        debug(chalk.red(error.message))
        return { OK: false }
    }
}

module.exports = { mySQL, existingUserMySQL, signUpWithMySQL }


