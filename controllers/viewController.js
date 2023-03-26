const Tour = require('../models/TourModel')

const catchAsync = require('../util/CatchAsync')




exports.getOverview = catchAsync(async(req, res) => {
    
    // 1) Get tour data from the collection

    const tours = await Tour.find()

    // 2) Build Template

    // 3) Render the Template using tour data from 1
    
    res
       .status(200)
       .render('overview', {
        title: 'All Tours',
        tours
       }) 
})

exports.getTour = catchAsync(async(req, res)=> {
    //get the data for the requested tour including reviews and guides

    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    //Build templates

    //Render template using data from before






    res
       .status(200)
       .render('tour', {
        title: tour.name,
        tour
       }) 
})