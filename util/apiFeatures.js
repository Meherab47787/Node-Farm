class APIFeatures {
    constructor(query, QueryString){
      this.query = query
      this.QueryString = QueryString
          }
  
      
      filter(){
          // eslint-disable-next-line node/no-unsupported-features/es-syntax
              const QueryObj = {...this.QueryString}                                                //Filtering
              const excludedQueryObj = ['page', 'limit', 'sort', 'fields']
              excludedQueryObj.forEach(el => delete QueryObj[el])
              
              let QueryStr = JSON.stringify(QueryObj)                                     //Advance Filtering
              QueryStr = QueryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
              
              this.query = this.query.find(JSON.parse(QueryStr))
              return this
      }
  
  
      sort(){
          if(this.QueryString.sort){                                         //Sorting
              const sortBy = this.QueryString.sort.split(',').join(' ')                                        
              this.query = this.query.sort(sortBy) 
          } 
              else {
                  this.query = this.query.sort('-createdAt _id')
              }
          return this        
          
      }
  
      limitFields(){
          if(this.QueryString.fields){                                         //Field Limiting
              const FieldsOut = this.QueryString.fields.split(',').join(' ')                                      
              console.log(FieldsOut);
              this.query = this.query.select(FieldsOut) 
          } 
              else{
                  this.query = this.query.select('-__v')
              }
          return this     
      }
  
      paginate(){
          const page = this.QueryString.page*1||1                     //Page Limiting
          const limit = this.QueryString.limit*1 || 100
          const skip = (page - 1)*limit
          //console.log(skip)
          this.query = this.query.skip(skip).limit(limit)
  
          return this
      }
  
  }

  module.exports = APIFeatures