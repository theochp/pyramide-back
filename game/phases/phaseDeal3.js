const Constants = require('../constants')

const requestInput = (socket, token) => {
  socket.emit('gameActionRequest', {
    gameRequest: Constants.GAME_REQUEST_DEAL_3_INTERVAL,
    responseToken: token,
  })
}

const handleResponse = async (socket, game, user, token) => {
  return new Promise(resolve => {
    socket.on('gameActionResponse', data => {
      if (data.responseToken === token) {
        if ([Constants.GAME_RESPONSE_DEAL_3_INSIDE, Constants.GAME_RESPONSE_DEAL_3_OUTSIDE].includes(data.response)) {
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
            if (data.response === Constants.GAME_RESPONSE_DEAL_3_INSIDE
              && (card.value > firstCard.value && card.value < secondCard.value)
            ) {
              isValid = true
            } else if (data.response === Constants.GAME_RESPONSE_DEAL_3_OUTSIDE
              && (card.value < firstCard.value && card.value > secondCard.value)
            ) {
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
              gorgee: user.gorgees += 3,
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