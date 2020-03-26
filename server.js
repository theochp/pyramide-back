const io = require('socket.io')
const Room = require('./data/room')

const server = io.listen(3001)

const rooms = []
const roomsSockets = []
rooms.push(new Room(42, 'Default room'))
roomsSockets[42] = []
server.on('connection', socket => {
  socket.emit('welcome', { rooms })

  socket.on('joinRoom', data => {
    rooms[0].join(data.user)
    roomsSockets[rooms[0].id].push(socket)

    socket.emit('joinRoomResponse', {
      success: true,
      message: '',
      room: rooms[0]
    })
  })
})