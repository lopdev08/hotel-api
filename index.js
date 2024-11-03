require('dotenv').config()

const connectDB = require('./config/mongo')

connectDB()

const express = require('express')
const app = express()

const cors = require('cors')
const logger = require('./middlewares/loggerMiddleware')
const handleError = require('./middlewares/handleError')
const notFound = require('./middlewares/notFound')

const roomsRouter = require('./routes/rooms')
const customersRouter = require('./routes/customers')
const reservationsRouter = require('./routes/reservations')
const loginRouter = require('./routes/login')

app.use(express.json())

app.use(cors())

app.use(logger)

app.use('/rooms', roomsRouter)

app.use('/customers', customersRouter)

app.use('/reservations', reservationsRouter)

app.use('/login', loginRouter)

app.use(notFound)

app.use(handleError)

const PORT = process.env.PORT

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }