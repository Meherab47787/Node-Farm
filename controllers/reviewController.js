const Review = require('../models/ReviewModel')
//const catchAsync = require("../util/CatchAsync")
const Factory = require('./handelerFactory')




exports.checkAndSetTourandUserID = (req, res, next) => {

    if(!req.body.tour) req.body.tour = req.params.tourId
    if(!req.body.user) req.body.user = req.user.id

    next()
}

exports.getAllReviews = Factory.getAll(Review)

exports.addReview = Factory.CreateOne(Review)

exports.deleteReview = Factory.DeleteOne(Review)

exports.updateReview = Factory.UpdateOne(Review)

exports.getSpecificReview = Factory.getOne(Review)