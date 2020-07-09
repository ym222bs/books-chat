const GoogleBooks = require('google-books-search')
const router = require('express').Router()
const Book = require('../models/book')

router.route('/')
  .get((req, res, next) => res.render('home', {title: 'Welcome Booklover..'}))

  .post((req, res) => {
    let searchField = req.body.searchField

    searchField.toString()

    GoogleBooks.search(searchField, { limit: 40 }, async (err, payload) => {
      err ? console.log(err) : console.log('payload')

      // payload.map(a => console.log(a.categories))

      if (searchField !== '') {
        // Summerar antal kategorier per grupp.
        let count = (ary, classifier) => {
          classifier = classifier || String
          return ary.reduce((counter, item) => {
            var p = classifier(item)
            counter[p] = counter.hasOwnProperty(p) ? counter[p] + 1 : 1
            return counter
          }, {})
        }

        const categories = count(payload, (item) => item.categories || ['undefined'])

        let sorteradeCategories = Object.entries(categories).map(x => ({ category: x[0], count: x[1] }))

        sorteradeCategories.sort((a, b) => (a.category < b.category) ? (-1) : 1)

        // Leta bland böcker hos den aktuella sessionsanvändaren,
        // för att hindra att användare dublicerar böcker i listan
        const match = await new Promise((resolve, reject) => {
          Book.find({ userID: req.session.user }, (err, data) => {
            return err ? reject(err) : resolve(data)
          })
        })

        // Om användaren redan har en sökt bok i sin favorit-lista
        // så bör användaren kunna se det och inte ha möjligheten att
        // lägga till boken ytterligare.
        const alreadyFavourites = match.map(book => book.id)

        let context = {
          bookInfo: payload.map(bookInfo => {
            return {
              id: bookInfo.id,
              img: bookInfo.thumbnail || 'http://i.imgur.com/sJ3CT4V.gif',
              title: bookInfo.title,
              authors: bookInfo.authors,
              year: bookInfo.publishedDate,
              cat: bookInfo.categories || ['undefined'],
              description: bookInfo.description,
              session: req.session.user,
              isFavourite: alreadyFavourites.includes(bookInfo.id)
            }
          }),
          sorteradeCategories: sorteradeCategories
        }
        return res.render('home', context)
      } else {
        req.session.flash = {
          type: 'warning',
          message: 'Search failed, please enter some text.'
        }
      }
    })
  })

router.route('/add-favourite')
  .post(async (req, res) => {
    let id = req.body.id

    const bookie = new Book()
    bookie.id = id
    bookie.userID = req.session.user
    bookie.username = req.session.username

    let match = await Book.find({ userID: req.session.user }, function (err, data) {
      (err) ? console.log(err) : console.log(data)
    })
    // Spara till Databas
    bookie.save((err, savedText) => {
      if (err)console.log(err)
      else {
        res.redirect('/user')
        return res.status(200).send()
      }
    })
  })

// Ta bort bok från sin favoritlista
router.route('/delete/:id')
  .get((req, res, next) => {
    Book.find({ id: req.params.id }, (err, data) => {
      if (err) console.log(err)
      return res.render('home', { id: req.params.id })
    })
  })
  .post((req, res, next) => {
    Book.deleteOne({ id: req.params.id }, (err) => {
      if (err) console.log(err)
      return res.redirect('/user')
    })
  })

module.exports = router
