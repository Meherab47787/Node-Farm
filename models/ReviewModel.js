// review / rating / createdAt / ref to tour / ref to user

const mongoose = require('mongoose')

const TourModel = require('./TourModel')

const ReviewSchema = new mongoose.Schema({

    review: {
        type: String,
        required: [true, 'A review must contain something']
        

    },

    rating: {
        type: Number,
        min: 1,
        max: 5

    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A review must belong to a tour']
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must come from an author']
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

ReviewSchema.index({tour: 1, user: 1}, {unique: true})


ReviewSchema.pre(/^find/, function(next){

    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // })


    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})

ReviewSchema.statics.calcRatingsAverage = async function(tourID) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourID}
        },

        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1},
                aveRating: {$avg: '$rating'}
            }
        }
    ])

    console.log(stats);

    if (stats.length>0){
        await TourModel.findByIdAndUpdate(tourID, 
            {
                ratingsQuantity: stats[0].nRating,
                ratingsAverage: stats[0].aveRating
            })
    } else {
        await TourModel.findByIdAndUpdate(tourID, 
            {
                ratingsQuantity: 0,
                ratingsAverage: 4.5
            })
    }

    
} 

ReviewSchema.post('save', function(){
    this.constructor.calcRatingsAverage(this.tour)
})


ReviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne()
    console.log(this.r);
    next()
})

ReviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calcRatingsAverage(this.r.tour)
})




const Review = mongoose.model('Review', ReviewSchema)

module.exports = Review