const objective = require('../src/index')
const knexInstance = require('./knex')
const o = objective(knexInstance)

describe('basic', () => {
  beforeEach(() => {
    return (async () => {
      await knexInstance.schema.createTable('users', t => {
        t.increments('id')
        t.string('name')
        t.integer('role_id')
        t.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE')
      }).createTable('roles', t => {
        t.increments('id')
        t.string('color')
      })
      await knexInstance('roles').insert([{ color: 'red' }, { color: 'blue' }])
      await knexInstance('users').insert([{ name: 'foo', role_id: 0 }, { name: 'bar', role_id: 1 }, { name: 'bar', role_id: 0 }])
    })()
  })
  afterEach(() => {
    return knexInstance.schema.dropTable('users')
      .dropTable('roles')
  })

  it('works', async () => {
    const model = o.model('User', {
      tableName: 'users',
      schema: {
        role: {
          references: 'Role'
        }
      }
    })
    const role = o.model('Role', {
      tableName: 'roles'
    })

    const res = await model.where({ name: 'bar' }).first()
    let r = await res.role
    console.log(r)
    console.log(r.color)
    r = await res.role
    console.log(r.color)
    // console.log(res.id, res.name)
  })
})
