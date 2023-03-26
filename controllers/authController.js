const crypto = require('crypto')
const {promisify} = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')
const catchAsync = require('../util/CatchAsync')
const AppError = require('../util/appError')
const sendEmail = require('../util/email')

const SignInToken = id => jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
})

const createSendToken = (user, statusCode, res) => {
    const token = SignInToken(user._id)

const jwtCookieOptions = {
    expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000
    ), 
    httpOnly: true
}

if(process.env.NODE_ENV === 'production'){
    jwtCookieOptions.secure = true
}

    res.cookie('jwt', token, jwtCookieOptions)
    
    user.password = undefined

    res
       .status(statusCode)
       .json({
            status: 'success',
            token,
            data: {
                user
            }
       })
}

exports.signup = catchAsync(async (req, res, next) => {
    


    const newUser = await User.create(req.body)
        // name: req.body.name,
        // email: req.body.email,
        // role: req.body.role,
        // password: req.body.password,
        // passwordConfirm: req.body.passwordConfirm
    createSendToken(newUser, 200, res)

})

exports.login = catchAsync (async (req, res, next) => {
    const {email, password} = req.body
    
    //1 Check if the email and password exists
    if(!email || !password){
       return next(new AppError('Please provide email and username', 400))
    }


    //2 Check if the user exists && the password is correct
    const user = await User.findOne({email}).select('+password')
     

    if(!email || !(await user.correctPassword(password, user.password))){
        next(new AppError('Incorrect email or password', 401))
    }
 
    

    //3 If everything is ok send the token to the client
    createSendToken(user, 200, res)
    

})

exports.protect = catchAsync(async (req, res, next) => {
    let token
    //1) Get the token and check if it exists
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token){
        return next(new AppError('You are not logged in, please log in for access', 401))
    }

    //2) Varify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    console.log(decoded);
    //3) Check if the user still exists
    const currentUser = await User.findById(decoded.id)
    if(!currentUser){
        return next(new AppError('The user of this token doesnot exist', 401))
    }


    //4) Check if the use changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password, please log in again', 401))
    }



    //Grant Access to the protected route
    req.user = currentUser
    //console.log(req.user.id)
    next()
})

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
    // eslint-disable-next-line no-unused-expressions
    return (req, res, next) => {
        //roles['admin', 'lead-guide'], role = ['user']
        if (!roles.includes(req.user.role)){
            return next(new AppError('You dont have permission to perform this action', 403))
        }
        next()
    } 
}

exports.forgotPassword = catchAsync(async(req, res, next) => {
    //1) Get user based on POSTed email

    const user = await User.findOne({email: req.body.email})

    if(!user){
        console.log(user);
        return next(new AppError('There is no user with that email address', 404))
    }

    //2) Generate random reset token
    const resetToken = user.createPasswordResetToken()
    
    await user.save({ validateBeforeSave: false})



    //3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Please submit a patch request with your new password and confirm your Password to ${resetURL} \nAnd if you didn't forget your password then ignore this email.`

    try{
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token is valid for (10 mins)',
            message
        })
    
        res
           .status(200)
           .json({
                status: 'success',
                message: 'Reset token sent to email'
           })
    }catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpire = undefined
        await user.save({ validateBeforeSave: false})

        return next(new AppError())

    }

    

})

exports.resetpassword = catchAsync(async (req, res, next) => {
   // 1) Get user based on token
   //console.log('before hash')
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    //console.log('done hash')
    const user = await User.findOne({passwordResetToken: hashedToken,
                                     passwordResetExpire: { $gt: Date.now() }
                                     })


   // 2) If token is expired and the user is expired then set new password
   if(!user){
    return next(new AppError('Token is either invalid or expired', 400))
   }
   user.password = req.body.password
   user.passwordConfirm = req.body.passwordConfirm
   user.passwordResetToken = undefined
   user.passwordResetExpire = undefined

   await user.save()
   // 3) Update changedPasswordAt property for the user (At UserModel as a middleware)
   // 4)Log the user in and send jwt
   createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password')

   if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
    return next(new AppError('Your current password is wrong', 401))
   }

   user.password = req.body.password
   user.passwordConfirm = req.body.passwordConfirm

   await user.save()

   createSendToken(user, 200, res)
})
