const passport = require('passport')
const eSession = require('express-session')

require('./strategies/local.strategy.js')()


module.exports = function passportConfig(app) {
    app.use(eSession({ secret: 'globomantics', resave: true, saveUninitialized: true}))
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => done(null, user) )
}