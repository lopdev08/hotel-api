const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Customer = require('../models/Customer')

class LoginController {
    static async login(req, res, next) {
        try {
            const { username, password } = req.body

            const customer = await Customer.findOne({ username })
            const passwordCorrect = customer === null ? false : await bcrypt.compare(password, customer.passwordHash)

            if (!(customer && passwordCorrect)) {
                return res.status(401).json({
                    error: 'Invalid username or password'
                })
            }

            const userForToken = {
                id: customer._id,
                username: customer.username
            }

            const token = jwt.sign(userForToken, process.env.SECRET, {
                expiresIn: 60 * 60 * 24 * 7
            })

            res.send({
                name: customer.name,
                username: customer.username,
                token: token
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = LoginController