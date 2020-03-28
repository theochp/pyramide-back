const Constants = require('../constants')

const requestInput = (socket, token) => {
  socket.emit('gameActionRequest', {
    gameRequest: Constants.GAME_REQUEST_DEAL_4,
    responseToken: token,
  })
}

const handleResponse = async (socket, game, user, token) => {
  return new Promise(resolve => {
    socket.on('gameActionResponse', data => {
      if (data.responseToken === token) {
        if (Constants.CARD_SUITS.includes(data.response)) {
          const card = game.deck[game.deckPtr++]

          let isValid = false
          if (user.cards.length === 3) {
            if (card.suit === data.response) {
              isValid = true
            }
          }

          if (isValid) {
            socket.emit('gameActionResponse', {
              ok: true,
              card: card
            })
          } else {
            socket.emit('gameActionResponse', {
              gorgee: user.gorgees += 4,
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