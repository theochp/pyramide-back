class Room {

  constructor(id, name) {
    this.id = id
    this.title = name
    this.users = new Map()
    this.started = false
    this.game = null
  }

  join(user) {
    this.users.set(user.id, user)
  }
}

module.exports = Room