const router = require('express').Router()
let nicknames = []

router.route('/chat')
  .get((req, res) => res.render('chat', { username: req.session.username }))

module.exports.router = router

module.exports.start = function (io) {
  io.sockets.on('connection', (socket) => {
    socket.on('new user', function (data) {
      socket.nickname = data
      nicknames.push(socket.nickname)

      updateNicknameList()
    })
    // Update the list of active users
    function updateNicknameList () {
      console.log('nick Array', nicknames)
      io.sockets.emit('usernames', nicknames)
    }
    // On event..
    socket.on('send message', (data) => {
      // ..send to all sockets
      console.log('send message')
      io.sockets.emit('new message', { message: data.message, nickname: socket.nickname })
    })
    socket.on('typing', (data) => {
      socket.broadcast.emit('typing', data)
    })
    socket.on('disconnect', (data) => {
      nicknames.splice(nicknames.indexOf(socket.nickname), 1)
      updateNicknameList()
    })
  })
}
