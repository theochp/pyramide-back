const GAME_PHASE_DEAL_1 = 'DEAL_1'
const GAME_PHASE_DEAL_2 = 'DEAL_2'
const GAME_PHASE_DEAL_3 = 'DEAL_3'
const GAME_PHASE_DEAL_4 = 'DEAL_4'

const GAME_REQUEST_DEAL_1_RED_OR_BLACK = 'DEAL_1_RED_OR_BLACK'
const GAME_RESPONSE_DEAL_1_RED = 'DEAL_1_RESPONSE_RED'
const GAME_RESPONSE_DEAL_1_BLACK = 'DEAL_1_RESPONSE_BLACK'

const CARD_SUIT_HEART = 'SUIT_HEART'
const CARD_SUIT_SPADE = 'SUIT_SPADE'
const CARD_SUIT_DIAMOND = 'SUIT_DIAMOND'
const CARD_SUIT_CLUB = 'SUIT_CLUB'

class Card {
  constructor(suit, value) {
    if (
      [
        CARD_SUIT_CLUB,
        CARD_SUIT_DIAMOND,
        CARD_SUIT_HEART,
        CARD_SUIT_SPADE,
      ].includes(suit)
      && value >= 1
      && value <= 13
    )
      this.suit = suit
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
      this.deck.push(new Card(CARD_SUIT_SPADE, i))
      this.deck.push(new Card(CARD_SUIT_HEART, i))
      this.deck.push(new Card(CARD_SUIT_CLUB, i))
      this.deck.push(new Card(CARD_SUIT_DIAMOND, i))
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
const gamePhaseDeal1 = async (game, sockets) => {
  // TODO: use better token
  let nextPhaseResponseToken = Math.random() * 1000

  const deal = async (socket, user) => {
    return new Promise(resolveDeal => {
      socket.emit('gameActionRequest', {
        gameRequest: GAME_REQUEST_DEAL_1_RED_OR_BLACK,
        responseToken: nextPhaseResponseToken,
      })
      socket.on('gameActionResponse', data => {
        if (data.responseToken === nextPhaseResponseToken) {
          if ([GAME_RESPONSE_DEAL_1_BLACK, GAME_RESPONSE_DEAL_1_RED].includes(data.response)) {
            const card = game.deck[game.deckPtr++]
            if (
              [CARD_SUIT_CLUB, CARD_SUIT_SPADE].includes(card.suit) && data.response === GAME_RESPONSE_DEAL_1_BLACK
              || [CARD_SUIT_DIAMOND, CARD_SUIT_HEART].includes(card.suit) && data.response === GAME_RESPONSE_DEAL_1_RED
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

const startGame = async (room, sockets) => {
  room.started = true
  const game = new Game(GAME_PHASE_DEAL_1, room.users)
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
  await gamePhaseDeal1(game, sockets)
}

module.exports = startGame