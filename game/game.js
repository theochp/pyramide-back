const Constants = require('./constants')
const phaseDeal = require('./phases/phaseDeal')

class Card {
  constructor(suit, value) {
    if (
      [
        Constants.CARD_SUIT_CLUB,
        Constants.CARD_SUIT_DIAMOND,
        Constants.CARD_SUIT_HEART,
        Constants.CARD_SUIT_SPADE,
      ].includes(suit)
      && value >= 1
      && value <= 13
    ) {
      this.suit = suit
    }
    this.value = value
  }
}

const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

class Game {
  constructor(phase, players) {
    this.phase = phase
    this.deck = []
    this.deckPtr = 0
    this.players = players
  }

  generateDeck() {
    let i
    for (i = 1; i <= 13; ++i) {
      this.deck.push(new Card(Constants.CARD_SUIT_SPADE, i))
      this.deck.push(new Card(Constants.CARD_SUIT_HEART, i))
      this.deck.push(new Card(Constants.CARD_SUIT_CLUB, i))
      this.deck.push(new Card(Constants.CARD_SUIT_DIAMOND, i))
    }
  }

  shuffleDeck() {
    let x
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      x = this.deck[i]
      this.deck[i] = this.deck[j]
      this.deck[j] = x
    }
  }
}
/*
TODO: give card to player, draw the other one and verify
 */


const startGame = async (room, sockets) => {
  room.started = true
  const game = new Game(Constants.GAME_PHASE_DEAL_1, room.users)
  room.game = game
  console.log('game started')
  game.generateDeck()
  game.shuffleDeck()
  // TODO: create socket room instead of sending to all
  sockets.forEach(socket => {
    socket.emit('gameUpdate', {
      type: 'GAME_PHASE_CHANGE',
      payload: {
        gamePhase: game.phase,
      },
    })
  })

  game.generateDeck()
  game.shuffleDeck()
  await phaseDeal(1, game, sockets)
  await delay(500)
  await phaseDeal(2, game, sockets)
  await delay(500)
  await phaseDeal(3, game, sockets)
  await delay(500)
  await phaseDeal(4, game, sockets)
}

module.exports = {
  Game: Game,
  startGame: startGame
}