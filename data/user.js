class User {
  constructor(id, name, admin, socket) {
    this.id = id
    this.name = name
    this.admin = admin
    this.socket = socket
    this.sips = 0
    this.cards = []
  }

  getPlayer(showCards) {
    return {
      name: this.name,
      sips: this.sips,
      cards: showCards ? this.cards : []
    }
  }
}

module.exports = User