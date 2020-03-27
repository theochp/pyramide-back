const Constants = require('../constants')

const gamePhaseDeal1 = async (game, sockets) => {
  // TODO: use better token
  let nextPhaseResponseToken = Math.random() * 1000

  const deal = async (socket, user) => {
    return new Promise(resolveDeal => {
      socket.emit('gameActionRequest', {
        gameRequest: Constants.GAME_REQUEST_DEAL_1_RED_OR_BLACK,
        responseToken: nextPhaseResponseToken,
      })
      socket.on('gameActionResponse', data => {
        if (data.responseToken === nextPhaseResponseToken) {
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
            resolveDeal()
          }
        }
      })
    })
  }

  const socketsIt = sockets.entries()
  let next = socketsIt.next()
  while (!next.done) {
    const userId = next.value[0]
    const socket = next.value[1]
    const user = game.players.get(userId)
    await deal(socket, user)
    next = socketsIt.next()
  }
}

module.exports = gamePhaseDeal1