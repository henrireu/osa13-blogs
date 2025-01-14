const Blog = require('./blog')
const User = require('./user')
const Readinglist = require('./readinglist')
const Session = require('./session')

User.hasMany(Blog)
Blog.belongsTo(User)

User.hasMany(Readinglist)
Readinglist.belongsTo(User)

Blog.hasMany(Readinglist)
Readinglist.belongsTo(Blog)

Session.belongsTo(User)

module.exports = {
  Blog, User, Readinglist
}