//C:\Program Files\MongoDB\Server\5.0\bin
const path = require('path')

const express = require('express')

const mongoSanitize = require('express-mongo-sanitize')

const xssClean = require('xss-clean')

const helmet = require('helmet')

const hpp = require('hpp')

const rateLimit = require('express-rate-limit')

const AppError = require('./util/appError')

// eslint-disable-next-line import/extensions
const globalErrorHandler = require('./controllers/errorController')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/views'))

// eslint-disable-next-line import/order
const morgan = require('morgan')  //Require Morgan

const TourRouter = require('./routes/TourRoutes')
const UserRouter = require('./routes/UserRoutes')
const ReviewRouter = require('./routes/ReviewRoute')
const ViewRouter = require('./routes/viewRoutes')

//Serving static files
app.use(express.static(path.join(__dirname, 'public')))
//Set secure HTTP headers
app.use(helmet())

console.log(path.join(__dirname, 'public'))
//console.log(process.env.NODE_ENV);
//Building a Middleware through morgan
//GLOBAL MIDDLEWARE
//Development logging
if(process.env.NODE_ENV ==='development'){
        app.use(morgan('dev'))
    }



//Rate Limiter    
const limiter = rateLimit({
    max: 100,
    windows: 60*60*1000,
    message: 'too many request from this IP for the time being, please try again later'
})
app.use('/api', limiter)

// Body parser (reading data from the body to req.body)
app.use(express.json({limit: '10kb'}))

//Data sanitization against NoSql data injection
app.use(mongoSanitize())

//Data Sanitization against xss
app.use(xssClean())

//Parameter pollution prevention

app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}))



//Test middleware
app.use(function(req, res, next){
    req.RequestTime = new Date().toISOString()
    next()
})

//Creating View Router middleware

app.use('/', ViewRouter)

//Creating Tour Router middleware

app.use('/api/v1/tours', TourRouter)



//Creating User Router middleware

app.use('/api/v1/users', UserRouter)



//Creating Review Router middleware

app.use('/api/v1/reviews', ReviewRouter)








/*-----------------------------------------*****-----------------------------------------*/

app.all('*', (req, res, next)=>{
    // res
    //    .status(404)
    //    .json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server!`
    //    })
        // const err = new Error(`Can't find ${req.originalUrl} on this server!`)
        // err.status = 'fail'
        // err.statusCode = 404

        next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
        
})


app.use(globalErrorHandler)
module.exports = app

