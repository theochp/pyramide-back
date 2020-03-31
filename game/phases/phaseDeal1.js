const Constants = require('../constants')

const requestInput = (user, token) => {
  user.socket.emit('gameActionRequest', {
    gameRequest: Constants.GAME_REQUEST_DEAL_1,
    responseToken: token,
  })
}

const handleResponse = async (game, user, token) => {
  return new Promise(resolve => {
    user.socket.on('gameActionResponse', function listener(data) {
      if (data.responseToken === token) {
        if ([Constants.GAME_DEAL_1_BLACK, Constants.GAME_DEAL_1_RED].includes(data.response)) {
          const card = game.deck[game.deckPtr++]
          if (
            [Constants.CARD_SUIT_CLUB, Constants.CARD_SUIT_SPADE].includes(card.suit) && data.response === Constants.GAME_DEAL_1_BLACK
            || [Constants.CARD_SUIT_DIAMOND, Constants.CARD_SUIT_HEART].includes(card.suit) && data.response === Constants.GAME_DEAL_1_RED
          ) {
            user.socket.emit('gameActionResponse', {
              gameResponse: Constants.GAME_RESPONSE_DEAL_1,
              data: {
                sips: 0,
                card: card
              }
            })
          } else {
            user.sips += 1
            user.socket.emit('gameActionResponse', {
              gameResponse: Constants.GAME_RESPONSE_DEAL_1,
              data: {
                sips: 1,
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