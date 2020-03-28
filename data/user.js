class User {
  constructor(id, name, admin) {
    this.id = id
    this.name = name
    this.admin = admin
    this.sips = 0
    this.cards = []
  }
}

module.exports = User