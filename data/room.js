class Room {
  constructor(id, name) {
    this.id = id
    this.title = name
    this.users = []
  }

  join(user) {
    this.users.push(user)
  }
}

module.exports = Room