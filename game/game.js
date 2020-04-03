const Constants = require('./constants')
const phaseDeal = require('./phases/phaseDeal')
const play = require('./phases/play')

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
    this.show = true
  }
}

class Game {
  constructor() {
    this.phase = null
    this.deck = []
    this.deckPtr = 0
  }

  generateDeck() {
    this.deck = []
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

const changeGamePhase = (room, gamePhase) => {
  room.game.phase = gamePhase
  room.broadcast('gameUpdate', {
    type: Constants.GAME_UPDATE_GAME_PHASE,
    payload: {
      gamePhase: gamePhase,
    },
  })
}

const startGame = async (room) => {
  const game = new Game()
  room.game = game
  room.started = true
  changeGamePhase(room, Constants.GAME_PHASE_WAITING)

  game.generateDeck()
  game.shuffleDeck()


  console.log('game started')

  changeGamePhase(room, Constants.GAME_PHASE_DEAL_1)
  await phaseDeal(1, room)

  changeGamePhase(room, Constants.GAME_PHASE_DEAL_2)
  await phaseDeal(2, room)

  changeGamePhase(room, Constants.GAME_PHASE_DEAL_3)
  await phaseDeal(3, room)

  changeGamePhase(room, Constants.GAME_PHASE_DEAL_4)
  await phaseDeal(4, room)

  changeGamePhase(room, Constants.GAME_PHASE_REMEMBER_CARDS)

  await new Promise(resolve => room.users.forEach(user => {
    if (user.admin) {
      user.socket.on('gameAction', action => {
        if (action.type === Constants.GAME_ACTION_START_PLAY) {
          resolve()
        }
      })
    }
  }))

  changeGamePhase(room, Constants.GAME_PHASE_PLAY)
  await play(room)
}

module.exports = {
  Game: Game,
  startGame: startGame,
}