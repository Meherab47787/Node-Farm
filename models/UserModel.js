const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

// name, e-mail, photo, password, password confirm

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        trim: true,
        maxlength: [20, 'A tour cannot have more than 20 character'],
        minlength: [5, 'Atour must have at least 5 character']

    },

    email: {
        type: String,
        required: [true, 'A user account should have an e-mail'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide your email']
    },

    photo: String,

    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },

    password: {
        type: String,
        required: [true, 'Please provide your password'],
        minlength: 8,
        select: false
    },

    passwordConfirm: {
        type:String,
        required: [true, 'Please confirm your provided password'],
        validate: {
            //This only works for CREATE and SAVE
            validator: function(el){
                return el === this.password
            },
            message: 'Passwords are not the same'
        }
    },
    passwordChangedAt: Date,

    passwordResetToken: String,

    passwordResetExpire: Date,

    Active: {
        type: Boolean,
        default: true,
        select: false
    }
})

UserSchema.pre('save', async function(next){
    //ONly run this function if password is actually modified
    if(!this.isModified('password')){
        return next()
    }
    //Hash the password at the cost of 12
    this.password = await bcrypt.hash(this.password, 12)
    //Delete the passwordConfirm field because it is not necessery
    this.passwordConfirm = undefined
    next()

})

UserSchema.pre('save', function(next){
    if (!this.isModified('password') || this.isNew){
        return next()
    }

    this.passwordChangedAt = Date.now() - 1000
    next()
})

UserSchema.pre('find', function(next){
    this.find({ Active: {$ne: false} })

    next()
})

UserSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}


UserSchema.methods.changedPasswordAfter = function(JWTTimeStamp){
    
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000, 10)
        return JWTTimeStamp < changedTimeStamp
    }
    //False means not changed
    return false
}

UserSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpire = Date.now() + 10*60*1000

    return resetToken
    
}

const User = mongoose.model('User', UserSchema)

module.exports = User