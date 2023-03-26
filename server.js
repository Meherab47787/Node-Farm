/* eslint-disable no-unused-vars */
//$env:NODE_ENV="production"
//Dependencies

//UNCAUGHT EXCEPTION ERROR HANDLER
process.on('uncaughtException', err => {
  console.log('Something unexpected occuered (Uncaught Exception). . . Server shutting down');
  console.log(err.name, err.message);
  process.exit(1)
})

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');



const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
                      useNewUrlParser: true,
                      useCreateIndex: true,
                      useFindAndModify: false,
                      useUnifiedTopology: true
                      }).then(con => {
                          //console.log(con.connections);
                          console.log('Db Connection was successful!');
                      })


// process.env.NODE_ENV=process.env.ENV
//console.log(process.env);
console.log(app.get('env'))

//Listening to port
const port = 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port} . . .`);
});

process.on('unhandledRejection', err => {
  console.log('Something unexpected occuered (Unhandled Rejection). . . Server shutting down');
  console.log(err.name, err.message);
  server.close(()=>{
    process.exit(1)
  })
  
})




//Test
