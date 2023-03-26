const AppError = require("../util/appError")


const handleCasrErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateError = err => {
    const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)
    const sendMessage = `Duplicate value found: ${value}, PLease make sure field values are ot identical`
    console.log(value);
    return new AppError(sendMessage, 400)
}

const handleValidationError = err => {
    const ErrorFields = Object.values(err.errors).map( el => el.message)
    
    const errorMessage = `Invalid input data: ${ErrorFields.join(', ')}`

    return new AppError(errorMessage, 400)
}

const handleJWTerror = () => new AppError('Invalid token please log in again', 401)


const handleTokenExpireError = () => new AppError('Your token has been expired, please log in again', 401)

const sendErrorDev = (err, res)=>{
    res
       .status(err.statusCode)
       .json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
       })
}

const sendErrorProd = (err, res)=>{
    if (err.isOperational){
    res
       .status(err.statusCode)
       .json({
        status: err.status,
        message: err.message
       })
    } else {
        console.error('ERROR OCCURED!', err);
        res
           .status(500)
           .json({
            status: 'Error',
            message: 'Something went wrong'
           })
        }
} 

module.exports = (err, req, res, next)=>{
    // console.log(typeof AppError)
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'fail'
    
    if(process.env.NODE_ENV ==='production'){

        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        let error={ ...err }

        //CAST ERROR
        if(err.name==='CastError'){
    
            // eslint-disable-next-line node/no-unsupported-features/es-syntax
            

            error = handleCasrErrorDB(error)
        }

        //DUBLICATE ERROR
        if(err.code === 11000){
            error = handleDuplicateError(error)
        }


        //VALIDATION ERROR
        if(err.name==='ValidationError'){
            error = handleValidationError(error)
        }

        //JWT Error
        if(err.name ==='JsonWebTokenError'){
            error = handleJWTerror(error)
        }

        //TokenExpire Error
        if(err.name === 'TokenExpiredError'){
            error = handleTokenExpireError(error)
        }


        sendErrorProd(error, res)
    }
    
    
    else if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res)
    }


    res
       .status(err.statusCode)
       .json({
        status: err.status,
        message: err.message
       })
}