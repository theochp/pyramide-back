const uuid = require('uuid').v4
const Constants = require('../constants')

const phaseDealHandlers = {
  1: require('./phaseDeal1'),
  2: require('./phaseDeal2'),
  3: require('./phaseDeal3'),
  4: require('./phaseDeal4'),
}

const gamePhaseDeal = async (phaseDeal, game, sockets) => {
  // TODO: use better token
  const handlers = phaseDealHandlers[phaseDeal]
  const deal = async (socket, user) => {
    const token = uuid()
    handlers.requestInput(socket, token)
    await handlers.handleResponse(socket, game, user, token)
  }

  const socketsIt = sockets.entries()
  let next = socketsIt.next()
  while (!next.done) {
    const userId = next.value[0]
    const socket = next.value[1]
    const user = game.players.get(userId)
    await deal(socket, user)
    next = socketsIt.next()
  }
}

module.exports = gamePhaseDeal