const Constants = require('../constants')

const requestInput = (user, token) => {
  user.socket.emit('gameActionRequest', {
    gameRequest: Constants.GAME_REQUEST_DEAL_3,
    responseToken: token,
  })
}

const handleResponse = async (game, user, token) => {
  return new Promise(resolve => {
    user.socket.on('gameActionResponse', function listener(data) {
      if (data.responseToken === token) {
        if ([Constants.GAME_DEAL_3_INSIDE, Constants.GAME_DEAL_3_OUTSIDE].includes(data.response)) {
          const card = game.deck[game.deckPtr++]

          let isValid = false
          if (user.cards.length === 2) {
            let firstCard = user.cards[0]
            let secondCard = user.cards[1]
            if (secondCard.value < firstCard.value) {
              const temp = firstCard
              firstCard = secondCard
              secondCard = temp
            }
            if (data.response === Constants.GAME_DEAL_3_INSIDE
              && (card.value > firstCard.value && card.value < secondCard.value)
            ) {
              isValid = true
            } else if (data.response === Constants.GAME_DEAL_3_OUTSIDE
              && (card.value < firstCard.value || card.value > secondCard.value)
            ) {
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
            user.sips += 3
            user.socket.emit('gameActionResponse', {
              gameResponse: Constants.GAME_RESPONSE_DEAL_2,
              data: {
                sips: 3,
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