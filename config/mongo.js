const mongoose = require('mongoose')

const { MONGO_DB_URI, MONGO_DB_URI_TEST, NODE_ENV } = process.env

const connectionString = NODE_ENV === 'test' ? MONGO_DB_URI_TEST : MONGO_DB_URI

const connectDB = async () => {
    try {
        await mongoose.connect(connectionString)

        console.log('Database connected')
    } catch (error) {
        console.error(error)
    }
}

module.exports = connectDB