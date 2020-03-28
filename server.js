const io = require('socket.io')
const uuid = require('uuid').v4
const Room = require('./data/room')
const User = require('./data/user')
const { startGame } = require('./game/game')

const server = io.listen(3001)

const rooms = new Map()
const roomsSockets = new Map()

// default data for tests
rooms.set("42", new Room("42", 'Default room'))
roomsSockets.set("42", new Map())

const joinRoom = (roomId, user, socket) => {

  roomsSockets.get(roomId).set(user.id, socket)
  rooms.get(roomId).join(user)
}

server.on('connection', socket => {
  // TODO : remove these two lines, find a way to properly remove player from party
  rooms.set("42", new Room("42", 'Default room'))
  roomsSockets.set("42", new Map())
  socket.on('joinRoom', data => {
    const joinRoomResponse = {
      success: false,
      message: '',
      room: null
    }
    const roomId = data['roomId']
    if (rooms.has(roomId)) {
      const user = new User(
        uuid(),
        data.user.name,
        true,// TODO: remove this default
      )
      joinRoom(
        roomId,
        user,
        socket
      )
      joinRoomResponse.success = true
      joinRoomResponse.room = rooms.get(roomId)
      joinRoomResponse.userId = user.id
    } else {
      joinRoomResponse.success = false
      joinRoomResponse.message = 'NO_SUCH_ROOM'
    }
    socket.emit('joinRoomResponse', joinRoomResponse)
  })
  socket.on('startGame', data => {
    const roomId = data['roomId']
    startGame(rooms.get(roomId), roomsSockets.get(roomId))
      .then(() => {
        console.log('game ended for room ' + roomId)
      })
  })
})