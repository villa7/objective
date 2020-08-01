const knex = require('knex')({
  client: 'sqlite3',
  connection: () => ({
    filename: 'test.db'
  }),
  useNullAsDefault: true
})

module.exports = knex
