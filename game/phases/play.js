const Constants = require('../constants')

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const inputNextCard = async room => {
  const toRemove = []
  const promise = new Promise(resolve => {
    // add listeners to all admins
    room.users.forEach(user => {
      if (user.admin) {
        toRemove.push(user.socket)
        user.socket.on('getNextCard', () => {

          resolve()
        })
      }
    })
  })
  await promise
  // once next card called, remove listeners
  for(let i = 0; i < toRemove.length; ++i)
    toRemove[i].removeAllListeners('getNextCard')
}

const play = async room => {
  const game = room.game

  room.broadcast('gameUpdate', {
    type: Constants.GAME_UPDATE_REMAINING_CARD,
    payload: {
      remainingCards: room.game.deck.length - room.game.deckPtr
    }
  })

  while (game.deckPtr < game.deck.length) {
    await inputNextCard(room)
    const card = game.deck[game.deckPtr++]
    room.broadcast('gameUpdate', {
      type: Constants.GAME_UPDATE_NEW_CARD,
      payload: { card },
    })
  }
}

module.exports = play