import Knex from "knex"
import { ModelProperties, ModelStaticProperties } from './model'
import Builder from './builder'

class Objectively {
  Models: { [key: string]: Builder } = {}
  knexInstance: Knex

  constructor (knexInstance: Knex) {
    this.knexInstance = knexInstance
  }

  model (modelName: string, properties: ModelProperties, staticProperties: ModelStaticProperties): Builder {
    const newModel = new Builder({ modelName, properties }, this.knexInstance, this.Models)
    // Object.assign(newModel, staticProperties)

    this.Models[modelName] = newModel

    return newModel
  }
}

module.exports = (knexInstance: Knex) => new Objectively(knexInstance)
