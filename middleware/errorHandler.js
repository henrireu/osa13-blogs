const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    const status = error.status || 500
    next(error)

    res.status(status).json({ 
        error: error.message || 'Internal Server Error' 
    })
}

module.exports = errorHandler