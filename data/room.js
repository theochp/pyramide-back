class Room {

  constructor(id, name, isPrivate) {
    this.id = id
    this.title = name
    this.users = new Map()
    this.started = false
    this.game = null
    this.private = isPrivate
  }

  join(user) {
    this.users.set(user.id, user)
  }
}

module.exports = Room