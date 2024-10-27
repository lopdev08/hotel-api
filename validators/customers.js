const { check, body, query } = require('express-validator')
const { validateResult } = require('../helpers/validateHelper')

const Customer = require('../models/Customer')

const validateCreate = [
    check('name')
        .exists()
        .notEmpty().withMessage('the name field is empty')
        .isString()
        .isLength({ min: 3, max: 50 })
        .matches(/^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+$/).withMessage('the name cannot contain numbers or special characters.')
    ,
    check('email')
        .exists()
        .notEmpty().withMessage('the email field is empty')
        .isString()
        .isEmail().withMessage('invalid email')
        .isLength({ max: 254 })
        .custom(async (value, { req }) => {
            const customer = await Customer.find({ email: { $regex: new RegExp(value, 'i') } })

            if (customer.length >= 1) {
                throw new Error('the email has already been registered')
            }

            return true
        })
    ,
    check('username')
        .exists()
        .notEmpty().withMessage('the username field is empty')
        .isString()
        .isLength({ min: 3, max: 50 })
        .custom(async (value, { req }) => {
            const customer = await Customer.find({ username: { $regex: new RegExp(value, 'i') } })

            if (customer.length >= 1) {
                throw new Error('the username has already been registered')
            }

            return true
        }
        )
    ,
    check('password')
        .exists()
        .notEmpty().withMessage('the password field is empty')
        .isString()
        .isLength({ min: 8, max: 50 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/).withMessage('the password must contain at least one uppercase letter, one lowercase letter and one number')
    ,
    check('phone')
        .exists()
        .notEmpty().withMessage('the phone field is empty')
        .isNumeric()
        .isInt()
        .toInt()
        .isLength({ min: 10, max: 15 }).withMessage('the minimum length is 10 and the maximum is 15')
    ,
    (req, res, next) => {
        validateResult(req, res, next)
    }
]
const validateQuery = [
    query('name')
        .optional()
        .notEmpty()
        .isString()
        .isLength({ min: 3, max: 50 })
        .matches(/^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+$/).withMessage('the name cannot contain numbers or special characters.')
    ,
    query('email')
        .optional()
        .notEmpty()
        .isString()
        .isEmail().withMessage('invalid email')
        .isLength({ max: 254 })
    ,
    query('phone')
        .optional()
        .notEmpty()
        .isNumeric()
        .isInt()
        .toInt()
        .isLength({ min: 3, max: 15 }).withMessage('the minimum length is 3 and the maximum is 15')
    ,
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

const validateUpdate = [
    body()
        .custom((value, { req }) => {
            const { name, email, phone, active_reservations } = req.body

            if (name || email || active_reservations) {
                throw new Error('you cannot edit the name, email or active reservations')
            }

            if (!phone) {
                throw new Error('phone is missing')
            }

            return true
        })
    ,
    check('phone')
        .exists()
        .notEmpty().withMessage('the phone field is empty')
        .isNumeric()
        .isInt()
        .toInt()
        .isLength({ min: 10, max: 15 })
        .custom(async (value, { req }) => {
            const id = req.params.id
            const customer = await Customer.findById(id)

            if (customer.phone === value) {
                throw new Error('you cannot update the field with the same value it already has. Please enter a different value.')
            }

            return true
        })
    ,
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

module.exports = { validateCreate, validateQuery, validateUpdate }