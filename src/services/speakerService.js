const axios = require('axios')
const debug = require('debug')('app:speakerService')
const chalk = require('chalk')

function speakerService () {
    function getSpeakerById (id) {
        return new Promise((resolve, reject) => {
            axios
                .get(process.env.SPEAKERS + id)
                .then(response => {
                    debug(chalk.yellowBright('Speaker data fetched'))
                    resolve(response)
                })
                .catch(error => {
                    debug(chalk.redBright(`Error fetching speaker with ID: ${id}`))
                    debug(chalk.redBright(error.message))
                    reject(error)
                })
        })
    }

    return { getSpeakerById }
}

module.exports = speakerService()