const Constants = require('../constants')

const requestInput = (socket, token) => {
  socket.emit('gameActionRequest', {
    gameRequest: Constants.GAME_REQUEST_DEAL_2_MORE_OR_LESS,
    responseToken: token,
  })
}

const handleResponse = async (socket, game, user, token) => {
  return new Promise(resolve => {
    socket.on('gameActionResponse', data => {
      if (data.responseToken === token) {
        if ([Constants.GAME_RESPONSE_DEAL_2_MORE, Constants.GAME_RESPONSE_DEAL_2_LESS].includes(data.response)) {
          const card = game.deck[game.deckPtr++]

          let isValid = true
          if (user.cards.length !== 1) {
            isValid = false
          } else {
            const firstCard = user.cards[0]
            if (data.response === Constants.GAME_RESPONSE_DEAL_2_MORE && firstCard.value >= card.value) {
              isValid = false
            } else if (data.response === Constants.GAME_RESPONSE_DEAL_2_LESS && firstCard.value <= card.value) {
              isValid = false
            }
          }

          if (isValid) {
            socket.emit('gameActionResponse', {
              ok: true,
              card: card
            })
          } else {
            socket.emit('gameActionResponse', {
              gorgee: user.gorgees += 2,
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