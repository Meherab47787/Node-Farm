const express = require('express')
const UserController = require("../controllers/UserController")
const AuthController = require("../controllers/authController")


/* 
Started Initializing the USERS routes
from here on . . .
*/



const Router = express.Router() //middleware

//User Routes Starts
Router
      .route('/signup')
      .post(AuthController.signup)



Router
      .route('/login')
      .post(AuthController.login)   
      


Router
      .route('/forgotPassword')
      .post(AuthController.forgotPassword)

Router
      .route('/resetPassword/:token')
      .patch(AuthController.resetpassword)      




Router.use(AuthController.protect)



Router
      .route('/updatePassword')
      .patch(AuthController.updatePassword)    

Router
      .route('/updateMe')
      .patch(UserController.updateMe)


Router
      .route('/deleteMe')
      .delete(UserController.deleteMe)      

Router
      .route('/me')
      .get(UserController.getMe, UserController.GetSpicificUser)
      


Router.use(AuthController.restrictTo('admin'))

Router 
   .route('/')
   .get(UserController.GetAllUsers)
   .post(UserController.CreateUser)

Router
   .route('/:id')
   .get(UserController.GetSpicificUser)
   .patch(UserController.UpdateSpecificUser)
   .delete(UserController.DeleteSpicificUser)

//User Routes Ends


module.exports = Router