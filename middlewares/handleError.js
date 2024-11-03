const ERROR_HANDLERS = {
    CastError: res => res.status(400).send({ error: 'id used is malformed' }),
    ValidationError: (res, { message }) => res.status(409).send({
        error: message
    }),
    JsonWebTokenError: res => res.status(401).json({
        error: 'invalid token'
    }),
    TokenExpiredError: res => res.status(401).json({
        error: 'token expired'
    })
}

const handleError = (error, req, res, next) => {
    console.error(error.name)
    const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError
    handler(res, error)
}

module.exports = handleError