const mongoose = require('mongoose');
const slugify = require('slugify')
const User = require('./UserModel') 

const TourSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour cannot have more than 40 character'],
        minlength: [10, 'Atour must have at least 10 character']
          },

    slug: String,   
       
    duration: {
        type: Number,
        required: [true, 'A tour must have e duration']
          },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have e group size']
          },
    difficulty: {
        type: String,
        required: [true, 'A tour must have e difficulty'],
        enum: {
          values: ['easy', 'medium', 'difficult'],
          message: 'The difficulty should be either "easy", "medium" or "hard"'
        }
          },      
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'A tour should have at least 1 as a rating'],
        max: [5, 'A tour cannot have an average rating over 5'],
        set: val => Math.round(val*10)/10
        },

    ratingsQuantity: {
        type: Number,
        default: 0
          },
          
    price: {
        type: Number,
        required: [true, 'A tour must come up with a price']
          },
    priceDiscount: {
        type: Number
          },
    summary: {
        type: String,
        trim: true,
        required: [true, 'Atour must have a description']
          },
    description: {
        type: String,
        trim: true
          },

    imageCover: {
        type: String,
        required: [true, 'Atour must have a cover image']
          },
    image: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
          },
    startDates: [Date],

    secretTour: {
              type: Boolean,
              default: false
          },
    
          
    startLocation: {

        type: {
          type: String,
          default: 'Point',
          enum: []
        },

        coordinates: [Number],
        address: String,
        description: String

    },
    
    locations: [
      {

        type: {
          type: String,
          default: 'Point',
          enum: []
        },

        coordinates: [Number],
        address: String,
        description: String,
        Day: Number

      }
    ],

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
      
    ]

    }, 
    
       {
                  toJSON: {virtuals: true},
                  toObject: {virtuals: true}
})

TourSchema.index({price: 1, ratingsAverage: -1})
TourSchema.index({slug: 1})
TourSchema.index({startLocation: '2dsphere'})

TourSchema.virtual('DurationWeeks').get(function(){
          return this.duration/7
    })


//Virtual Populate
TourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})

//MONGODB MIDDLEWARE    
TourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true})
    next()
  })

// TourSchema.pre('save', function(next){
//     console.log('Will save doccument . . .');
//     next()
//   })


// TourSchema.post('save', function(doc, next){
//     console.log(doc);
//     next()
//   })


//QUERY MIDDLEWARE
TourSchema.pre(/^find/, function(next){

  this.find({secretTour: {$ne: true}})
  this.start = Date.now()
  next()
})

TourSchema.pre(/^find/, function(next){
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
   })

   next()
})

TourSchema.pre('save', async function(next){
  const guidePromises = this.guides.map(async id => await User.findById(id))
   this.guides = await Promise.all(guidePromises)

   next()
})

TourSchema.post(/^find/, function(docs, next){
  console.log(`Time taken: ${Date.now() - this.start} milliseconds`);
  next()
})



//AGGREGATION MIDDLEWARE
// TourSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({$match: {secretTour: {$ne: true} } } )
//     //console.log(this.pipeline());
//     next()
//   })

const Tour = mongoose.model('Tour', TourSchema)

module.exports = Tour  