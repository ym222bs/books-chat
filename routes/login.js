const router = require('express').Router()
const BookUser = require('../models/user')

router.route('/login')
  .get((req, res, next) => res.render('login'))

  .post((req, res, next) => {
    BookUser.findOne({ username: req.body.username }, (err, user) => {
      if (!user) {
        req.session.flash = {
          type: 'danger',
          message: 'No BookLover with that name or password :('
        }
        if (req.body.username === '') {
          req.session.flash = {
            type: 'danger',
            message: 'Please fill in the empty field.'
          }
        }
        console.log(err)
        res.redirect('/login')
      }
      if (user) {
        user.comparePassword(req.body.password, (err, user2) => {
          console.log('user2', user2)
          if (err) {
            console.log(err)
          } else if (!user2) {
            req.session.flash = {
              type: 'danger',
              message: 'Wowowow, easy there. Try again :)'
            }
            res.redirect('/login')
          } else if (user2) {
            req.session.flash = {
              type: 'primary',
              message: 'Welcome Booklover! :)'
            }
            // Start a session as the user log in successfully.
            req.session.user = user._id
            req.session.username = user.username
            res.redirect('/user')
            res.status(200).send()
          }
        })
      }
    })
  })

module.exports = router
