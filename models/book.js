
const mongoose = require('mongoose')

const bookObject = new mongoose.Schema({
  id: {
    type: String
  },
  userID: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }

})

const Book = mongoose.model('bookies', bookObject)

module.exports = Book
