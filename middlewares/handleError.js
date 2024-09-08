const handleError = (error, req, res, next) => {
    console.error(error)

    if (error.name === 'CastError') {
        return res.status(400).json({ error: 'id used is malformed' })
    } else {
        return res.status(500).end()
    }
}

module.exports = handleError