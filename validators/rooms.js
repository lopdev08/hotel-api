const { check, body, query } = require('express-validator')
const { validateResult } = require('../helpers/validateHelper')
const Room = require('../models/Room')
const Reservation = require('../models/Reservation')

const validateCreate = [
    check('number')
        .exists()
        .notEmpty().withMessage('the number field is empty')
        .isNumeric()
        .isInt()
        .toInt()
        .isLength({ min: 1, max: 3 })
        .custom(async (value, { req }) => {
            const roomExist = await Room.find({ number: value })

            if (roomExist.length > 0) {
                throw new Error('The room number is already registered')
            }

            return true
        })
    ,
    check('type')
        .exists()
        .notEmpty().withMessage('the type field is empty')
        .isString()
        .toLowerCase()
        .isAlpha()
        .isIn(['doble', 'individual', 'suite']).withMessage('invalid room type')
    ,
    check('description')
        .exists()
        .notEmpty().withMessage('the description field is empty')
        .isString()
        .isLength({ min: 20, max: 200 })
        .matches(/^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+$/).withMessage('the description cannot contain numbers or special characters.')
    ,
    check('price_per_nigth')
        .exists()
        .notEmpty().withMessage('the price_per_nigth field is empty')
        .isFloat()
        .toFloat()
        .custom((value, { req }) => {
            if (value < 50 || value > 1000) {
                throw new Error('the minimum price is 50 and the maximum is 1000')
            }

            return true
        })
    ,
    check('availability')
        .exists()
        .notEmpty().withMessage('the availability field is empty')
        .isBoolean().withMessage('availability must be a boolean value')
    ,
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

const validateQuery = [
    query('type')
        .optional()
        .notEmpty()
        .isString()
        .isIn(['individual', 'suite', 'doble']).withMessage('invalid room type')
    ,
    query('availability')
        .optional()
        .notEmpty()
        .isBoolean().withMessage('availability must be a boolean value')
        .toBoolean()
    ,
    query('min_price')
        .optional()
        .notEmpty()
        .isNumeric()
        .isFloat()
        .toFloat()
        .custom((value, { req }) => {
            if (value < 50 || value > 1000) {
                throw new Error('the minimum price is 50 and the maximum is 1000')
            }

            return true
        })
    ,
    query('max_price')
        .optional()
        .notEmpty()
        .isNumeric()
        .isFloat()
        .toFloat()
        .custom((value, { req }) => {
            if (value < 50 || value > 1000) {
                throw new Error('the minimum price is 50 and the maximum is 1000')
            }
        })
    ,
    query('number')
        .optional()
        .notEmpty()
        .isNumeric()
        .isInt()
        .toInt()
        .isLength({ min: 1, max: 3 })
    ,
    query('description')
        .optional()
        .notEmpty()
        .isString()
        .isLength({ min: 20, max: 200 })
        .matches(/^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+$/).withMessage('the description cannot contain numbers or special characters.')
    ,
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

const validateUpdate = [
    body()
        .custom((value, { req }) => {
            const { type, price_per_nigth, availability, number, description } = req.body

            if (number || description) {
                throw new Error('you cannot edit the number or description')
            }

            if (!type && !price_per_nigth && availability === '') {
                throw new Error('at least one field is required to edit')
            }

            return true
        })
    ,
    check('type')
        .exists()
        .optional()
        .notEmpty().withMessage('the type field is empty')
        .isString()
        .toLowerCase()
        .isAlpha()
        .isIn(['doble', 'individual', 'suite']).withMessage('invalid room type')
    ,
    check('price_per_nigth')
        .exists()
        .optional()
        .notEmpty().withMessage('the price_per_nigth field is empty')
        .isNumeric()
        .isFloat()
        .toFloat()
        .custom(async (value, { req }) => {
            const id = req.params.id
            const room = await Room.findById(id)

            if (value < 50 || value > 1000) {
                throw new Error('the minimum price is 50 and the maximum is 1000')
            }

            if (room.price_per_nigth === value) {
                throw new Error('you cannot update the field with the same value it already has. Please enter a different value.')
            }

            return true
        })
    ,
    check('availability')
        .exists()
        .optional()
        .notEmpty().withMessage('the availability field is empty')
        .isBoolean().withMessage('availability must be a boolean value')
        .custom(async (value, { req }) => {
            const id = req.params.id
            const room = await Room.findById(id)
            const reservation = await Reservation.find({ room_id: id })

            switch (String(value)) {
                case "true": {
                    const reservedRoom = reservation.length > 0 ? true : false
                    const activeStates = ['checked-in', 'confirmed']

                    if (room.availability === value) {
                        throw new Error('you cannot update the field with the same value it already has. Please enter a different value.')
                    }

                    if (reservedRoom) {
                        if (activeStates.includes(reservation[0].status)) {
                            throw new Error('you cannot change the availability of a room that is in use')
                        }
                    }

                    break
                }

                case "false": {
                    if (room.availability === value) {
                        throw new Error('you cannot update the field with the same value it already has. Please enter a different value.')
                    }

                    break
                }
            }
        })
    ,
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

module.exports = { validateCreate, validateUpdate, validateQuery }