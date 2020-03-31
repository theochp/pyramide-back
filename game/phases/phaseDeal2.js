const Constants = require('../constants')

const requestInput = (user, token) => {
  user.socket.emit('gameActionRequest', {
    gameRequest: Constants.GAME_REQUEST_DEAL_2,
    responseToken: token,
  })
}

/**
 *
 * @param game Game
 * @param user User
 * @param token String
 * @returns {Promise<unknown>}
 */
const handleResponse = async (game, user, token) => {
  return new Promise(resolve => {
    user.socket.on('gameActionResponse', function listener(data) {
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
            user.socket.emit('gameActionResponse', {
              gameResponse: Constants.GAME_RESPONSE_DEAL_2,
              data: {
                sips: 0,
                card: card
              }
            })
          } else {
            user.sips += 2
            user.socket.emit('gameActionResponse', {
              gameResponse: Constants.GAME_RESPONSE_DEAL_2,
              data: {
                sips: 2,
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