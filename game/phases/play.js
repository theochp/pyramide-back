const Constants = require('../constants')

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const inputNextCard = async room => {
  const toRemove = []
  const promise = new Promise(resolve => {
    // add listeners to all admins
    room.users.forEach(user => {
      if (user.admin) {
        toRemove.push(user.socket)
        user.socket.on('getNextCard', () => {

          resolve()
        })
      }
    })
  })
  await promise
  // once next card called, remove listeners
  for(let i = 0; i < toRemove.length; ++i)
    toRemove[i].removeAllListeners('getNextCard')
}

const computePyramidRows = (nCards) => {
  let n = 0
  let total = 0

  while (total + n + 1 < nCards) {
    n++
    total += n
  }

  return {
    nRows: n,
    totalCards: total,
  }
}

const play = async room => {
  const game = room.game

  // Handle players showing their cards
  const playersIt = room.users.values()
  let next = playersIt.next()
  while (!next.done) {
    const user = next.value
    user.socket.on('showCard', data => {
      const cardIdx = data['cardIdx']
      if (cardIdx >= 0 && cardIdx < user.cards.length) {
        room.broadcast('gameUpdate', {
          type: Constants.GAME_UPDATE_USER_SHOW_CARD,
          card: user.cards[cardIdx],
          cardIdx: cardIdx,
          user: user.getPlayer()
        }, user.socket)
      }
    })
    next = playersIt.next()
  }

  const remainingCards = room.game.deck.length - room.game.deckPtr
  room.broadcast('gameUpdate', {
    type: Constants.GAME_UPDATE_REMAINING_CARD,
    payload: {
      remainingCards
    }
  })

  const pyramidRows = computePyramidRows(remainingCards)
  let i = 0
  while (i++ < pyramidRows.totalCards) {
    await inputNextCard(room)
    const card = game.deck[game.deckPtr++]
    room.broadcast('gameUpdate', {
      type: Constants.GAME_UPDATE_NEW_CARD,
      payload: { card },
    })
  }
}

module.exports = play