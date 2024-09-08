const mongoose = require('mongoose')

const connectionString = process.env.MONGO_DB_URI

const connectDB = async () => {
    try {
        await mongoose.connect(connectionString)

        console.log('Database connected')
    } catch (error) {
        console.error(error)
    }
}

module.exports = connectDB