class Room {

  constructor(id, name, isPrivate, broadcast) {
    this.id = id
    this.name = name
    this.users = new Map()
    this.started = false
    this.game = null
    this.private = isPrivate
    this.adminToken = ''
    this.broadcast = broadcast
  }

  getSafeVersion() {
    return {
      id: this.id,
      name: this.name,
      started: this.started,
      private: this.private,
    }
  }

  join(user) {
    this.users.set(user.id, user)
  }
}

module.exports = Room