class Room {

  constructor(id, name, isPrivate, broadcast) {
    this.id = id
    this.name = name
    this.users = new Map()
    this.started = false
    this.game = null
    this.private = isPrivate
    this.broadcast = (key, data) => {
      const it = this.users.values()
      let next = it.next()
      while(!next.done) {
        next.value.socket.emit(key, data)
        next = it.next()
      }
    }
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