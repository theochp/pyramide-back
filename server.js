const io = require('socket.io').listen(3001)
const uuid = require('uuid').v4
const Constants = require('./game/constants')
const Room = require('./data/room')
const User = require('./data/user')
const { startGame } = require('./game/game')

const rooms = new Map()

// default data for tests
// rooms.set('42', new Room('42', 'Default room'))
// roomsSockets.set('42', new Map())

const createRoom = (socket, data) => {
  // Create room
  const roomId = uuid()
  const room = new Room(
    roomId,
    data['roomName'],
    data['private'],
    (key, data, fromSocket = null) => {
      if (fromSocket) {
        fromSocket.broadcast.to(roomId).emit(key, data)
      } else {
        io.to(roomId).emit(key, data)
      }
    }
  )
  room.adminToken = uuid()

  // Add room
  rooms.set(roomId, room)

  // Notify room creator
  socket.emit('createRoomResponse', { roomId, token: room.adminToken })

  // TODO : change event name, maybe create a socket room for those who already got the list, to prevent sending the list to users that are not on this page
  // update room list
  io.sockets.emit('getRoomsResponse', {
    rooms: Array.from(rooms.values()).map(room => room.getSafeVersion()).filter(room => !room.private),
  })
}

const joinRoom = (socket, data) => {

  const joinRoomResponse = {
    success: false,
    message: '',
    room: null,
    isAdmin: false
  }

  const roomId = data['roomId']
  const adminToken = data['adminToken']
  const room = rooms.get(roomId)

  if (room) {
    // Create user
    const isAdmin = adminToken === room.adminToken
    joinRoomResponse.isAdmin = isAdmin
    const user = new User(
      uuid(),
      data.user.name,
      isAdmin,
      socket,
    )

    // Join room socket
    socket.join(roomId)

    room.broadcast('gameUpdate', {
      type: Constants.GAME_UPDATE_USER_JOINED,
      user: user.getPlayer(),
    }, socket)

    // Join room
    rooms.get(roomId).join(user)

    // Listen on start game
    if (isAdmin)
      socket.on('startGame', () => {
        startGame(room)
          .then(() => {
            console.log('game ended for room ' + roomId)
          })
      })

    // Update response
    joinRoomResponse.success = true
    joinRoomResponse.room = room.getSafeVersion()
    joinRoomResponse.userId = user.id
  } else {
    joinRoomResponse.success = false
    joinRoomResponse.message = 'NO_SUCH_ROOM'
  }

  // Send response
  socket.emit('joinRoomResponse', joinRoomResponse)
}

io.on('connection', socket => {
  socket.on('joinRoom', data => joinRoom(socket, data))
  socket.on('createRoom', data => createRoom(socket, data))
  socket.on('getRooms', () => {
    socket.emit('getRoomsResponse', {
      rooms: Array.from(rooms.values()).map(room => room.getSafeVersion()).filter(room => !room.private),
    })
  })
})