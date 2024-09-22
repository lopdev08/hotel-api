const { Router } = require('express')

const CustomerController = require('../controllers/customers')

const customersRouter = Router()

const { validateCreate, validateQuery, validateUpdate } = require('../validators/customers')

customersRouter.get('/', validateQuery, CustomerController.getAll)

customersRouter.get('/:id', CustomerController.getById)

customersRouter.post('/', validateCreate, CustomerController.create)

customersRouter.put('/:id', validateUpdate, CustomerController.update)

customersRouter.delete('/:id', CustomerController.delete)

module.exports = customersRouter