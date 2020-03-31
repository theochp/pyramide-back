const uuid = require('uuid').v4
const Constants = require('../constants')

const phaseDealHandlers = {
  1: require('./phaseDeal1'),
  2: require('./phaseDeal2'),
  3: require('./phaseDeal3'),
  4: require('./phaseDeal4'),
}

const dealPhases = {
  1: Constants.GAME_PHASE_DEAL_1,
  2: Constants.GAME_PHASE_DEAL_2,
  3: Constants.GAME_PHASE_DEAL_3,
  4: Constants.GAME_PHASE_DEAL_4,
}

const gamePhaseDeal = async (phaseDeal, room, sockets) => {
  const handlers = phaseDealHandlers[phaseDeal]
  const deal = async (user) => {
    const token = uuid()
    handlers.requestInput(user, token)
    await handlers.handleResponse(room.game, user, token)
  }

  const playersIt = room.users.values()
  let next = playersIt.next()
  while (!next.done) {
    const user = next.value
    await deal(user)
    next = playersIt.next()
  }
}

module.exports = gamePhaseDeal