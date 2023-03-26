const catchAsync = require('../util/CatchAsync')
const AppError = require('../util/appError')
const APIFeatures = require("../util/apiFeatures")


exports.DeleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    
    if(!doc){
        return next(new AppError(`no document found with ID: ${req.params.id}`, 404))
    }


        res
        .status(204)
        .json({
            status:'success',
            data: null
        })
    
        
        
    })



exports.UpdateOne = Model => catchAsync(async (req, res, next) => {
    
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true
    })

    if(!doc){
        return next(new AppError(`No document found with ID: ${req.params.id}`, 404))
    }

    res
    .status(200)
    .json({
        status:'success',
        data: {
           data : doc
        }
    })

    
})  


exports.CreateOne = Model => catchAsync(async (req, res, next) => {    const doc = await Model.create(req.body)

    res.status(201)
                .json({
                    status: 'Success',
                    data: {
                        data: doc
                    }
                })                                   //Creating tour
    
    
    })


    exports.getOne = (Model, popOptions) => catchAsync(async(req, res, next) => {
          

        let query = Model.findById(req.params.id)
        
        if(popOptions) query =  query.populate(popOptions)
        
        

        
        // let query
        // if(popOptions) {
        //     query = await Model.findById(req.params.id).populate(popOptions)
        // }
        // else {
        //     query = await Model.findById(req.params.id)
        // }
        

        const doc = await query

        if(!doc){
            return next(new AppError(`No documents found with ID: ${req.params.id}`, 404))
        }

         res
        .status(200)
        .json({
            status: 'Success',
            data: {
                doc
            }
        })
   
})

exports.getAll = Model => catchAsync (async(req, res, next) => {                                 //Get all tours 


    //For nested routes for reviews on tours
    let filter = {}
    if(req.params.tourId) filter = {tour: req.params.tourId}
    
        
    const features = new APIFeatures(Model.find(filter), req.query)
                                                            .filter()
                                                            .sort()
                                                            .limitFields()
                                                            .paginate()  
    
    
    const doc = await features.query                   //Send FINAL Response to tours
     
    res  
        .status(200)                                                   
        .json({
            status: 'Success',
            result: doc.length,
            data:{
                doc
            }
        })



})