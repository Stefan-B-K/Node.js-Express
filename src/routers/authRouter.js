const express = require('express')
const debug = require('debug')('app:authRouter')
const chalk = require('chalk')
const passport = require('passport')

const { signUpWithMongoDB, existingUserMongo } = require('../services/mongo.js')
const { signUpWithMySQL, existingUserMySQL } = require('../services/mysql.js')


const authRouter = express.Router()

authRouter.route('/signUp').post(async (request, response) => {
    const { username, password, database } = request.body
    const user = { username, password, database }

    if (!!(await existingUserMongo(username)) || !!(await existingUserMySQL(username))) {
        debug(chalk.redBright('Username is not available'))
        response.redirect('/')
    } else {
        const signUpSuccess = database === 'mongodb' ? await signUpWithMongoDB(user) : await signUpWithMySQL(user)
        if (signUpSuccess.OK) {
            request.login(signUpSuccess.user, () => response.redirect('/auth/profile'))         // .login()   by Passport
        } else {
            response.redirect('/')
        }
    }
})

authRouter.route('/signIn')
    .get((request, response) => {
        if (request.user) response.redirect(request.headers.referer)
        else response.render('signin')
    })
    .post(passport.authenticate('localStrategy', {
        successRedirect: '/auth/profile',
        failureRedirect: '/auth/signIn'
    }))

authRouter.route('/profile').get((request, response) => {
    if (request.user) response.render('userProfile', { user: request.user })                // .user        added to request by Passport
    else response.redirect('/auth/signIn')
})

authRouter.route('/logout').get((request, response) => {
    request.logout(err => {
        if (err) { return next(err) }
        response.redirect('/')
    })
})

module.exports = authRouter



