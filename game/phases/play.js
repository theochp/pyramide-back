const Constants = require('../constants')

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const play = async room => {
  const game = room.game
  while (game.deckPtr < game.deck.length) {
    const card = game.deck[game.deckPtr++]
    room.broadcast('gameUpdate', {
      type: Constants.GAME_UPDATE_NEW_CARD,
      payload: { card },
    })
    await delay(1000)
  }
}

module.exports = play