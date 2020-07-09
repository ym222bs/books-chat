const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
})


userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()
  bcrypt.genSalt(saltRounds)
    .then(salt => bcrypt.hash(this.password, salt))
    .then(hash => {
      this.password = hash
      next()
    }).catch(err => console.log(err))
})

// to compare the password given
userSchema.methods.comparePassword = function (inputPassword, callback) {
  console.log(inputPassword)
  bcrypt.compare(inputPassword, this.password)
    .then((res) => callback(null, res))
    .catch(callback)
}

const User = mongoose.model('BOOK_USERS', userSchema)

module.exports = User
