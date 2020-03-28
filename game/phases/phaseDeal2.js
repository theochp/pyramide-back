const Constants = require('../constants')

const requestInput = (socket, token) => {
  socket.emit('gameActionRequest', {
    gameRequest: Constants.GAME_REQUEST_DEAL_2,
    responseToken: token,
  })
}

const handleResponse = async (socket, game, user, token) => {
  return new Promise(resolve => {
    socket.on('gameActionResponse', function listener(data) {
      if (data.responseToken === token) {
        if ([Constants.GAME_DEAL_2_MORE, Constants.GAME_DEAL_2_LESS].includes(data.response)) {
          const card = game.deck[game.deckPtr++]

          let isValid = false
          if (user.cards.length === 1) {
            const firstCard = user.cards[0]
            if (data.response === Constants.GAME_DEAL_2_MORE && card.value > firstCard.value) {
              isValid = true
            } else if (data.response === Constants.GAME_DEAL_2_LESS && card.value < firstCard.value) {
              isValid = true
            }
          }

          if (isValid) {
            socket.emit('gameActionResponse', {
              gameResponse: Constants.GAME_RESPONSE_DEAL_2,
              data: {
                sips: 0,
                card: card
              }
            })
          } else {
            user.sips += 2
            socket.emit('gameActionResponse', {
              gameResponse: Constants.GAME_RESPONSE_DEAL_2,
              data: {
                sips: 2,
                card: card
              }
            })
          }
          user.cards.push(card)
          socket.removeListener('gameActionResponse', listener)
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