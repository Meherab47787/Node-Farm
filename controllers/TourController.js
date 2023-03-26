/* eslint-disable import/no-useless-path-segments */

// eslint-disable-next-line import/no-useless-path-segments

const Tour = require('./../models/TourModel')
//const APIFeatures = require('./../util/apiFeatures')
const catchAsync = require('./../util/CatchAsync')
const AppError = require('./../util/appError')
const Factory = require('./handelerFactory')







exports.tourAlias = (req,res,next)=>{
    // eslint-disable-next-line no-unused-expressions, no-sequences
    req.query.limit = '5',
    req.query.sort = '-ratingsAverage,price',
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty',
    next()
}





/* 
Started Initializing the tours routes
from here on . . .
*/

exports.GetAlltours = Factory.getAll(Tour)

 //Get specific tour using parameters
exports.GetSpecificTour = Factory.getOne(Tour, {path: 'reviews'})



// catchAsync(async(req, res, next) => {
   
//         const SpecificTour = await Tour.findById(req.params.id).populate('reviews')
//         if(!SpecificTour){
//             return next(new AppError(`no tours found with ID: ${req.params.id}`, 404))
//         }

//          res
//         .status(200)
//         .json({
//             status: 'Success',
//             data: {
//                 SpecificTour
//             }
//         })
    
    
   
// })

// eslint-disable-next-line arrow-body-style

//Create a Tour
exports.CreateTour = Factory.CreateOne(Tour)

//Update Tour                                                                       Update Tour
exports.UpdateTour = Factory.UpdateOne(Tour)  
    
//Delete A Tour

exports.DeleteTour = Factory.DeleteOne(Tour)





// exports.DeleteTour = catchAsync(async (req, res, next) => {
//     const DeletedTour = await Tour.findByIdAndDelete(req.params.id)
    
//     if(!DeletedTour){
//         return next(new AppError(`no tours found with ID: ${req.params.id}`, 404))
//     }


//         res
//         .status(204)
//         .json({
//             status:'success',
//             data: null
//         })
    
        
        
//     })



exports.GetStats = catchAsync(async (req, res)=>{

   
        const stats = await Tour.aggregate([
            {
                $match: {ratingsAverage: {$gte: 4.5}}
            },

            {
                $group: {
                    _id: '$difficulty',
                    totalTours: {$sum: 1},
                    totalRating: {$sum: '$ratingsQuantity'},
                    avgRating: {$avg: '$ratingsAverage'},
                    avgPrice: {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'}

                }

            },

            {
                $sort: {avgPrice: -1}
            }


        ])

        res
        .status(200)
        .json({
            status:'success',
            data: {
                stats
            }
        })

    


})


exports.MonthlyPlan = catchAsync(async (req,res) => {

   
        const year = req.params.year*1

        const plan = await Tour.aggregate([

            {
                $unwind: '$startDates'
            },

            {
                $match: {
                         startDates:{
                                       $gte: new Date(`${year}-01-01`),
                                       $lte: new Date(`${year}-12-31`),
                                    }
                        }
            },

            {
                $group: {
                    _id: {$month: '$startDates'},
                    numTourStarts: {$sum: 1},
                    tours: {$push: '$name'}
                    
                }
            },

            {
                $addFields: {month: '$_id'}
            },

            {
                $project: {_id:0}
            },

            {
                $sort: {numTourStarts: -1}
            },

            {
                $limit: 12
            }
        ]);

        res
        .status(200)
        .json({
            status:'success',
            data: {
                plan
            }
        })
        
    
})





exports.getToursWithin = catchAsync(async(req,res,next) => {
    const {distance, latlng, unit} = req.params
    const [lat, lng] = latlng.split(',')

    const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1
    console.log(radius);
    if(!lat || !lng) {
        next(new AppError('Please provide the latitude and longitude', 400))
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: {$centerSphere: [[lng, lat], radius]} } })

    res
       .status(200)
       .json({
        stauts: 'success',
        results: tours.length,
        data: {
            data: tours
        }
       })

})


exports.getDistances = catchAsync(async (req, res, next) => {
    const {latlng, unit} = req.params
    const [lat, lng] = latlng.split(',')


    const multiplier = unit === 'mi' ? 0.000621371 : 0.001

    if(!lat || !lng) {
        next(new AppError('Please provide the latitude and longitude', 400))
    }

    const distances = await Tour.aggregate([
        {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [lng*1, lat*1]
                    },

                    distanceField: 'distance',
                    distanceMultiplier: multiplier

            }
        },

            {
                $project: {
                    distance: 1,
                    name: 1
                }

            }
        
    ])


    res
       .status(200)
       .json({
        stauts: 'success',
        data: {
            data: distances
        }
    })

})






/*
Ended the Initialization of the TOURS rouths 
till here
 */