const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    creation: {
        type: Date,
        default: Date.now()
    }
})

UserSchema.post('save', (doc) => {
    console.log('%s has been saved', doc._id);
  });  

const User = mongoose.model("User", UserSchema)
module.exports = User