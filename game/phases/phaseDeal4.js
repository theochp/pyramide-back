const Constants = require('../constants')

const requestInput = (user, token) => {
  user.socket.emit('gameActionRequest', {
    gameRequest: Constants.GAME_REQUEST_DEAL_4,
    responseToken: token,
  })
}

const handleResponse = async (game, user, token) => {
  return new Promise(resolve => {
    user.socket.on('gameActionResponse', function listener(data) {
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
            user.socket.emit('gameActionResponse', {
              gameResponse: Constants.GAME_RESPONSE_DEAL_2,
              data: {
                sips: 0,
                card: card
              }
            })
          } else {
            user.sips += 4
            user.socket.emit('gameActionResponse', {
              gameResponse: Constants.GAME_RESPONSE_DEAL_2,
              data: {
                sips: 4,
                card: card
              }
            })
          }
          user.cards.push(card)
          user.socket.removeListener('gameActionResponse', listener)
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