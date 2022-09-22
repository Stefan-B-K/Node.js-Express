const passport = require('passport')
const { Strategy } = require('passport-local')
const debug = require('debug')('app:localStrategy')
const chalk = require('chalk')

const { existingUserMongo } = require('../../services/mongo.js')
const { existingUserMySQL } = require('../../services/mysql.js')


module.exports = function localStrategy () {
    passport.use('localStrategy',
        new Strategy({
            usernameField: 'username',
            passwordField: 'password'
        }, (username, password, done) => {
            (async function validateUser () {
                try {
                    let user = await existingUserMongo(username)

                    if (user && user.password === password) {
                        debug(chalk.blue('User logged in with MongoDB'))
                        done(null, user)
                    } else {
                        user = await existingUserMySQL(username)
                        if (user && user.password === password) {
                            debug(chalk.cyanBright('User logged in with MySQL'))
                            done(null, user)
                        } else {
                            debug(chalk.red('Invalid username or password'))
                            done(null, false)
                        }
                    }
                } catch (error) {
                    debug(error)
                    done(error, false)
                }
            })()
        })
    )
}