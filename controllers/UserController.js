const catchAsync = require("../util/CatchAsync")
const User = require('../models/UserModel')
const AppError = require("../util/appError")
const CatchAsync = require("../util/CatchAsync")
const Factory = require('./handelerFactory')
// const { findByIdAndUpdate } = require("../models/UserModel")

// eslint-disable-next-line no-unused-vars

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(element => {
        if(allowedFields.includes(element)){
            newObj[element] = obj[element]
        }
    });
    return newObj
}





exports.CreateUser = function(req, res){
res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
    })
}    

exports.updateMe = catchAsync( async (req, res, next) => {
    //1) Create Error if user tries to update password

    if (req.body.password || req.body.passwordConfirm ){
        next(new AppError("This route is not for uprating password, in order to do that please use 'UpdatePassword' route", 400))
    }
    // 2) filtyer out unwanted fields
    const filteredBody = filterObj(req.body, 'name', 'email')    
 
    
    // 3) Update the user document

    
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    })

    res
       .status(200)                
       .json({
        status: 'success',
        user: updatedUser
       })
})

exports.deleteMe = CatchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {Active: false})

    res
       .status(204)
       .json({
        status: 'success',
        data: null
       }) 
})


exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

exports.GetAllUsers = Factory.getAll(User)

exports.GetSpicificUser = Factory.getOne(User)


exports.UpdateSpecificUser = Factory.UpdateOne(User) 


exports.DeleteSpicificUser = Factory.DeleteOne(User)
/*
Ended the Initialization of the USERS rouths  
till here
*/