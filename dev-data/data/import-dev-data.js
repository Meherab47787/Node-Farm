const fs = require('fs')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require("../../models/TourModel")
const User = require("../../models/UserModel")
const Review = require('../../models/ReviewModel')


dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
                      useNewUrlParser: true,
                      useCreateIndex: true,
                      useFindAndModify: false,
                      useUnifiedTopology: true
                      }).then(() => {
                          //console.log(con.connections);
                          console.log('DB connection was a Success!');
                      })

//READ Json FIlE
const uploadTours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
    )


const uploadUsers = JSON.parse(
    fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
    )

const uploadReviews = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
    )    
    
const importData = async() =>{
    try{
        await User.create(uploadUsers, {validateBeforeSave: false})
        await Tour.create(uploadTours)
        await Review.create(uploadReviews)
        console.log('Data successfully loaded')
        process.exit()
    } catch(err){
        console.log(err);
    }
}

const deleteData = async() =>{
    try{
        await User.deleteMany()
        await Tour.deleteMany()
        await Review.deleteMany()
        console.log('Data successfully deleted')
        process.exit()
    } catch(err){
        console.log(err)
    }
}

if(process.argv[2]==='--import'){
    importData()
    console.log('Data successfully loaded to the Database');
        } 
        else if(process.argv[2]==='--delete'){
            deleteData()
            console.log('Data successfully deleated from the Database');
        }


