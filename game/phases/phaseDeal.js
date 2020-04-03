const uuid = require('uuid').v4
const Constants = require('../constants')

const phaseDealHandlers = {
  1: require('./phaseDeal1'),
  2: require('./phaseDeal2'),
  3: require('./phaseDeal3'),
  4: require('./phaseDeal4'),
}

const gamePhaseDeal = async (phaseDeal, room) => {
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

    room.broadcast('gameUpdate', {
      type: Constants.GAME_UPDATE_CARD_DEALT,
      payload: {
        user: user.getPlayer(),
        card: user.cards[user.cards.length - 1]
      }
    }, user.socket)

    next = playersIt.next()
  }
}

module.exports = gamePhaseDeal