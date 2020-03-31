const io = require('socket.io').listen(3001)
const uuid = require('uuid').v4
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
  )

  // Listen on start game
  socket.on('startGame', () => {
    console.log('start game')
    startGame(room)
      .then(() => {
        console.log('game ended for room ' + roomId)
      })
  })

  // Add room
  rooms.set(roomId, room)

  // Notify room creator
  socket.emit('createRoomResponse', { roomId })
}

const joinRoom = (socket, data) => {

  const joinRoomResponse = {
    success: false,
    message: '',
    room: null,
  }

  const roomId = data['roomId']
  const room = rooms.get(roomId)

  if (room) {
    // Create user
    const isAdmin = true // TODO: add user to room on creation and set admin to true only for him
    const user = new User(
      uuid(),
      data.user.name,
      isAdmin,
      socket,
    )

    // Join room socket
    // socket.join(roomId) // TODO: find a way to make socket rooms to work

    // Notify room that a new user joined
    // room.broadcast('userJoined', {
    //   user,
    // })

    // Join room
    rooms.get(roomId).join(user)

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
      rooms: Array.from(rooms.values()).map(room => room.getSafeVersion()),
    })
  })
})