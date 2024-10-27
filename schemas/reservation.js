const { Schema } = require('mongoose')

const reservationSchema = new Schema({
    customer_id: String,
    customer_name: String,
    room_id: String,
    room_number: Number,
    check_in_date: String,
    check_out_date: String,
    total_amount: Number,
    status: String,
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    }
})

reservationSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id

        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = reservationSchema