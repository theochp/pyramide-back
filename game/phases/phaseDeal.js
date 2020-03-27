const uuid = require('uuid').v4
const Constants = require('../constants')

const phaseDealHandlers = {
  1: require('./phaseDeal1'),
  2: require('./phaseDeal2'),
}

const gamePhaseDeal = async (phaseDeal, game, sockets) => {
  // TODO: use better token
  const handlers = phaseDealHandlers[phaseDeal]
  const deal = async (socket, user) => {
    let nextPhaseResponseToken = uuid()
    handlers.requestInput(socket, nextPhaseResponseToken)
    await handlers.handleResponse(socket, game, user, nextPhaseResponseToken)
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