import Knex, { QueryBuilder } from "knex"
import Model, { ModelProperties } from './model'
import Collection from "./collection"

type ModelData = {
  modelName: string,
  properties: ModelProperties
}
type QueryObject = {
  [key: string]: string | number | boolean | Model
}

export default class Builder {
  idAttribute: string
  tableName: string
  properties: ModelProperties
  _knex: QueryBuilder
  _otherModels: { [key: string]: Builder }

  constructor (data: ModelData, knex: Knex, models: { [key: string]: Builder }) {
    this.idAttribute = data.properties.idAttribute || 'id'
    this.tableName = data.properties.tableName
    this.properties = data.properties
    this._otherModels = models
    this._knex = knex(this.tableName)

    for (const key of ['where', 'whereNot', 'first']) {
      this[key] = function (...params: any[]): Builder {
        const cleaned = cleanParams(params)
        this._knex = this._knex[key](...cleaned)
        return this
      }
    }
  }

  then (resolve: Function, reject: Function) {
    try {
      this._knex.then(res => {
        if (Array.isArray(res)) {
          const models = res.map((x: { [key: string]: any }) => new Model(x, this.properties, this._otherModels))
          resolve(Collection.from(models))
        } else {
          const model = new Model(res, this.properties, this._otherModels)
          resolve(model)
        }
      })
    } catch (e) {
      reject(e)
    }
  }

  find (query: QueryObject = {}): Builder {
    const cleaned = cleanQuery(query)
    this._knex = this._knex.where(cleaned).first()
    return this
  }

  query (callback: Function): Builder {
    if (!callback) throw new Error('.query(callback) missing callback')
    if (!(callback instanceof Function)) throw new Error('.query(callback) expects a callback function')
    const res = callback(this._knex)
    if (!(res instanceof QueryBuilder)) throw new Error('.query(callback) expects the callback to return the knex QueryBuilder')
    this._knex = res
    return this
  }
}

const cleanQuery = (query: QueryObject) => {
  const copy = {}
  for (const key in query) {
    if (query[key] instanceof Model) {
      console.warn('not implemented')
    } else {
      copy[key] = query[key]
    }
  }
  return copy
}

const cleanParams = (params: any[]) => {
  return params.map(cleanQuery)
}
