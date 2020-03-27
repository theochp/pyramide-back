const Constants = require('../constants')

const requestInput = (socket, token) => {
  socket.emit('gameActionRequest', {
    gameRequest: Constants.GAME_REQUEST_DEAL_1_RED_OR_BLACK,
    responseToken: token,
  })
}

const handleResponse = async (socket, game, user, token) => {
  return new Promise(resolve => {
    socket.on('gameActionResponse', data => {
      if (data.responseToken === token) {
        if ([Constants.GAME_RESPONSE_DEAL_1_BLACK, Constants.GAME_RESPONSE_DEAL_1_RED].includes(data.response)) {
          const card = game.deck[game.deckPtr++]
          if (
            [Constants.CARD_SUIT_CLUB, Constants.CARD_SUIT_SPADE].includes(card.suit) && data.response === Constants.GAME_RESPONSE_DEAL_1_BLACK
            || [Constants.CARD_SUIT_DIAMOND, Constants.CARD_SUIT_HEART].includes(card.suit) && data.response === Constants.GAME_RESPONSE_DEAL_1_RED
          ) {
            socket.emit('gameActionResponse', {
              ok: true,
              card: card
            })
          } else {
            socket.emit('gameActionResponse', {
              gorgee: ++user.gorgees,
              card: card
            })
          }
          user.cards.push(card)
          resolve()
        }
      }
    })
  })
}

module.exports = {
  requestInput,
  handleResponse,
}