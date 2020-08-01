import Builder from "./builder"

export type ModelProperties = {
  tableName: string,
  idAttribute?: string,
  schema: { [key: string]: any }
}
export type ModelStaticProperties = {

}

export default class Model {
  idAttribute: string
  related: { [key: string]: Model }

  constructor (obj: { [key: string]: any }, properties: ModelProperties, models: { [key: string]: Builder }) {
    this.idAttribute = properties.idAttribute || 'id'
    this.related = {}

    for (const key in obj) {
      Object.defineProperty(this, key, {
        enumerable: true,
        get () {
          return obj[key]
        }
      })
    }

    if (properties.schema) {
      for (const key in properties.schema) {
        const schemaItem = properties.schema[key]

        if (this[key] !== undefined) continue

        if (schemaItem.references) {
          const refModel = models[schemaItem.references]
          const idOnObj = obj[`${key}_${refModel.idAttribute}`]
          if (idOnObj === undefined) continue

          Object.defineProperty(this, key, {
            enumerable: true,
            async get () {
              if (this.related[key]) return this.related[key]

              // @ts-ignore
              const res = await refModel.find({ [refModel.idAttribute]: idOnObj })
              this.related[key] = res
              return res
            }
          })
        }
      }
    }
  }
}
