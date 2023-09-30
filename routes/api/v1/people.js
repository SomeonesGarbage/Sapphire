const express = require('express')
const router = express.Router()

const con = require('../../../other/mysqlConnection')
const logger = require('../../../other/logger')
const config = require('../../../config.json')

const moment = require('moment')

const { placeholderBio } = config

const fetch = require('node-fetch')

router.post('/', (req, res) => {
    const serviceToken = req.get('x-nintendo-servicetoken').slice(0, 42)
    const nnid = req.get('NNID')

    console.log(logger.MySQL(`Creating New Account For ${nnid}`))

    con.query(`SELECT * FROM account WHERE nnid="${nnid}"`, function (err, result, fields) {
        if (err) { throw err }

        console.log(result)

        if (JSON.stringify(result).replace('[]', '')) {
            console.log(logger.Error(`There has already been an account created for ${nnid}`))
            res.send('{ success : 0 }')
        } else {
            fetch(`https://nnidlt.murilo.eu.org/api.php?env=production&user_id=${nnid}`).then(response => response.text()).then(response => {
                const responseObject = JSON.parse(response)

                con.query(`INSERT INTO account (nnid, serviceToken, name, bio, admin, pid, mii, hash, banned) VALUES("${responseObject.user_id}", "${serviceToken}", "${responseObject.name}", "${config.placeholderBio}", 0, ${responseObject.pid}, "${responseObject.data}", "${responseObject.images.hash}", 0);`, function (err, result, fields) {
                    if (err) {console.log(logger.Error(err)); res.sendStatus(503); return;} else {
                        console.log(logger.MySQL('Account Created!'))
                        res.sendStatus(201)
                    }   
                })

            })
        }
    })
})

router.get('/', (req, res) => {
    res.sendStatus(404)
})



module.exports = router