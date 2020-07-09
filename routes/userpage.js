const router = require('express').Router()
const GoogleBooks = require('google-books-search')
const Book = require('../models/book')

router.route('/user')
  .get((req, res, next) => {
    if (req.session.user) {
      Book.find({ userID: req.session.user }, async (err, books) => {
        if (err) return next(err)

        const createPromise = (id) => {
          return new Promise((resolve, reject) => {
            GoogleBooks.lookup(id, (err, payload) => {
              if (err) {
                console.log(err)
                return reject(err)
              } else {
                return resolve(payload)
              }
            })
          }).catch((err) => next(err))
        }

        const booksInfo = await Promise.all(books.map((book) => {
          return createPromise(book.id)
        }))
        const context = {
          bookInfo: booksInfo.map(bookInfo => {
            return {
              id: bookInfo.id,
              img: bookInfo.thumbnail || 'http://i.imgur.com/sJ3CT4V.gif',
              title: bookInfo.title,
              authors: bookInfo.authors,
              year: bookInfo.publishedDate,
              cat: bookInfo.categories,
              description: bookInfo.description
            }
          }),
          title2: 'we have missed you :)'
        }
        res.render('user', context)
      })
    } else {
      res.redirect('/login')
    }
  })

module.exports = router
