const { check, body, query } = require('express-validator')
const { validateResult } = require('../helpers/validateHelper')

const Reservation = require('../models/Reservation')
const Customer = require('../models/Customer')
const Room = require('../models/Room')

const validateCreate = [
    body()
        .custom((value, { req }) => {
            const { check_in_date, check_out_date } = req.body

            if (check_out_date < check_in_date) {
                throw new Error('the check out date must be greater than the check in date')
            }

            return true
        })
    ,
    check('customer_id')
        .exists()
        .notEmpty().withMessage('the customer_id field is empty')
        .isMongoId().withMessage('the id must be an object id')
        .custom(async (value, { req }) => {
            const customer = await Customer.findById(value)

            if (!customer) {
                throw new Error('customer not found')
            }

            if (customer.active_reservations >= 5) {
                throw new Error('there can only be a maximum of 5 active reservations')
            }

            return true
        })
    ,
    check('room_id')
        .exists()
        .notEmpty().withMessage('the room_id field is empty')
        .isMongoId().withMessage('the id must be an object id')
        .custom(async (value, { req }) => {
            const room = await Room.findById(value)

            if (!room) {
                throw new Error('room not found')
            }

            if (!room.availability) {
                throw new Error('the room is already in use')
            }

            return true
        })
    ,
    check('check_in_date')
        .exists()
        .notEmpty().withMessage('the check_in_date field is empty')
        .isISO8601().withMessage('the entry date must be in ISO format (YYYY-MM-DD)')
        .custom((value, { req }) => {
            const date = new Date().toISOString()

            if (value < date) {
                throw new Error('the check in date cannot be less than the current date')
            }

            return true

        })
    ,
    check('check_out_date')
        .exists()
        .notEmpty().withMessage('the check_out_date field is empty')
        .isISO8601().withMessage('the entry date must be in ISO format (YYYY-MM-DD)')
        .custom((value, { req }) => {
            const date = new Date().toISOString()

            if (value < date) {
                throw new Error('the check out date cannot be less that the current date')
            }

            return true
        })
    ,
    (req, res, next) => {
        validateResult(req, res, next)
    }
]
const validateQuery = [
    query('check_in_date')
        .optional()
        .notEmpty()
        .isISO8601().withMessage('the entry date must be in ISO format (YYYY-MM-DD)')
    ,
    query('check_out_date')
        .optional()
        .notEmpty()
        .isISO8601().withMessage('the entry date must be in ISO format (YYYY-MM-DD)')
    ,
    query('customer_id')
        .optional()
        .notEmpty()
        .isMongoId().withMessage('the id must be an object id')
    ,
    query('room_id')
        .optional()
        .notEmpty()
        .isMongoId().withMessage('the id must be an object id')
    ,
    (req, res, next) => {
        validateResult(req, res, next)
    }
]
const validateUpdate = [
    body()
        .custom(async (value, { req }) => {
            const id = req.params.id
            const { customer_name, room_number, check_in_date, total_amount, customer_id, room_id, check_out_date, status } = req.body

            const reservation = await Reservation.findById(id)

            if (!reservation) {
                throw new Error('reservation not found')
            }

            const nonEditableStatuses = ['completed', 'checked-out', 'canceled', 'no-show']

            if (nonEditableStatuses.includes(reservation.status.toLowerCase())) {
                throw new Error('you cannot edit reservations in completed, canceled, no-show or checked-out status')
            }

            if (customer_name || room_number || check_in_date || total_amount) {
                throw new Error('you cannot edit the customer_name, room_number, check_in_date or total_amount')
            }

            if (!customer_id && !room_id && !check_out_date && !status) {
                throw new Error('at least one field is required to edit')
            }

            return true

        })
    ,
    check('customer_id')
        .exists()
        .optional()
        .notEmpty().withMessage('the customer_id field is empty')
        .isMongoId()
        .custom(async (value, { req }) => {
            const customer = await Customer.findById(value)

            if (!customer) {
                throw new Error('customer not found')
            }

            return true
        })
    ,
    check('room_id')
        .exists()
        .optional()
        .notEmpty().withMessage('the room_id field is empty')
        .isMongoId()
        .custom(async (value, { req }) => {
            const room = await Room.findById(value)

            if (!room) {
                throw new Error('room not found')
            }

            if (!room.availability) {
                throw new Error('the room is not available')
            }

            return true
        })
    ,
    check('check_out_date')
        .exists()
        .optional()
        .notEmpty().withMessage('the check_out_date field is empty')
        .isISO8601().withMessage('the entry date must be in ISO format (YYYY-MM-DD)')
        .custom(async (value, { req }) => {
            const id = req.params.id
            const reservation = await Reservation.findById(id)

            if (reservation.check_out_date === value) {
                throw new Error('you cannot update the field with the same value it already has. Please enter a different value.')
            }

            if (reservation.check_in_date >= value) {
                throw new Error('the check out date must be greater than the check in date')
            }

            return true
        })
    ,
    check('status')
        .exists()
        .optional()
        .notEmpty().withMessage('the status field is empty')
        .isString()
        .isIn(['checked-in', 'checked-out', 'completed', 'canceled', 'no-show']).withMessage('invalid status')
    ,
    (req, res, next) => {
        validateResult(req, res, next)
    }
]

module.exports = { validateCreate, validateQuery, validateUpdate }