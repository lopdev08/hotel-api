const { Router } = require('express')

const LoginController = require('../controllers/login')

const loginRouter = Router()

loginRouter.post('/', LoginController.login)

module.exports = loginRouter