const io = require('socket.io')
const uuid = require('uuid').v4
const Room = require('./data/room')
const User = require('./data/user')
const { startGame } = require('./game/game')

const server = io.listen(3001)

const rooms = new Map()
const roomsSockets = new Map()

// default data for tests
// rooms.set('42', new Room('42', 'Default room'))
// roomsSockets.set('42', new Map())

/*
  TODO: use room object as server view for a room, and add a method getClientRoom that returns a room instance with non-sensitive data
 */

const createRoom = (socket, data) => {
  const roomId = uuid()
  rooms.set(roomId, new Room(roomId, data['roomName'], data['private']))
  roomsSockets.set(roomId, new Map())
  socket.emit('createRoomResponse', { roomId })
}

const joinRoom = (roomId, user, socket) => {
  socket.join('room_' + roomId)
  server.to('room_' + roomId).emit('userJoined', {
    user,
  })
  roomsSockets.get(roomId).set(user.id, socket)
  rooms.get(roomId).join(user)
}

server.on('connection', socket => {
  socket.on('joinRoom', data => {
    const joinRoomResponse = {
      success: false,
      message: '',
      room: null,
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
        socket,
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
  socket.on('createRoom', data => createRoom(socket, data))
  socket.on('getRooms', () => {
    socket.emit('getRoomsResponse', {
      rooms: Array.from(rooms.values())
    })
  })
  socket.on('startGame', data => {
    const roomId = data['roomId']
    startGame(rooms.get(roomId), roomsSockets.get(roomId))
      .then(() => {
        console.log('game ended for room ' + roomId)
      })
  })
})