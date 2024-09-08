const { Router } = require('express')

const CustomerController = require('../controllers/customers')

const customersRouter = Router()

customersRouter.get('/', CustomerController.getAll)

customersRouter.get('/:id', CustomerController.getById)

customersRouter.post('/', CustomerController.create)

customersRouter.put('/:id', CustomerController.update)

customersRouter.delete('/:id', CustomerController.delete)

module.exports = customersRouter