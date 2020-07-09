let router = require('express').Router()
let User = require('../models/user')

router.route('/register')
  .get((req, res, next) => res.render('reg'))

  .post(async(req, res, next) => {
    try {
      let username = req.body.username
      let password = req.body.password

      let user = await User.findOne({ username: username }).exec()

      if (user) { throw new Error('Username already exists.') }

      req.check('password').isLength({ min: 4, max: 12 }).equals(req.body.passwordComfirm)

      if (!/^[a-z0-9]+$/i.test(req.body.username)) {
        throw new Error('Invalid username. Only letters and numbers are allowed. No spaces.')
      }
      var errors = req.validationErrors()

      if (errors) {
        throw new Error('Password 4-12 characters long.')
      } else {
        let bookUser = new User()
        bookUser.username = username
        bookUser.password = password

        let savedUser = await bookUser.save()

        req.session.flash = {
          type: 'success',
          message: 'The registration was a success! Please Login in :)'
        }
        return res.redirect('/login')
      }
    } catch (err) {
      req.session.flash = {
        type: 'danger',
        message: err.message
      }
      res.redirect('/register')
    }
  })

module.exports = router
