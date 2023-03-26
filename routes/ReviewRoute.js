const express = require('express')
const reviewController = require('../controllers/reviewController')
const AuthController = require("../controllers/authController")



const Router = express.Router({ mergeParams: true })

Router.use(AuthController.protect)


Router
      .route('/')
      .get(reviewController.getAllReviews)
      .post(
            AuthController.restrictTo('user'),
            reviewController.checkAndSetTourandUserID, 
            reviewController.addReview
            )

Router
      .route('/:id')
      .delete(
            AuthController.restrictTo('user', 'admin'),     
            reviewController.deleteReview
            )

      .patch(
            AuthController.restrictTo('user', 'admin'), 
            reviewController.updateReview)
            
      .get(reviewController.getSpecificReview)





module.exports = Router