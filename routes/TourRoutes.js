/* eslint-disable import/no-useless-path-segments */
const express = require('express')

const AuthController = require('../controllers/authController')

const TourController = require('../controllers/TourController')

const ReviewRouter = require('./ReviewRoute')

const Router = express.Router()

// Router.param('id', TourController.checkID)

// Router
//       .route('/:tourId/reviews')
//       .post(AuthController.protect, 
//             AuthController.restrictTo('user'), 
//             ReviewController.addReview)

//Tours Routes Starts

Router.use('/:tourId/reviews', ReviewRouter)

Router
      .route('/tour-stats')
      .get(TourController.GetStats)

Router
      .route('/monthly-plan/:year')
      .get(AuthController.protect, 
           AuthController.restrictTo('admin', 'lead-guide', 'guide'),  
           TourController.MonthlyPlan)
Router
      .route('/top-5-cheap')
      .get(TourController.tourAlias, TourController.GetAlltours)

//GET ALL TOURS
Router
    .route('/')
    .get(TourController.GetAlltours)
    .post(AuthController.protect, 
          AuthController.restrictTo('admin', 'lead-guide'), 
          TourController.CreateTour)
    
//Delete Tour
Router
    .route('/:id')
    .get(TourController.GetSpecificTour)

    .patch(AuthController.protect, 
           AuthController.restrictTo('admin', 'lead-guide'), 
           TourController.UpdateTour)

    .delete(AuthController.protect, 
            AuthController.restrictTo('admin', 'lead-guide'), 
            TourController.DeleteTour)



Router
      .route('/distances/:latlng/unit/:unit')
      .get(TourController.getDistances)
            

            
Router
      .route('/tours-within/:distance/center/:latlng/unit/:unit')
      .get(TourController.getToursWithin)            
// //Tours Routes Ends



module.exports = Router