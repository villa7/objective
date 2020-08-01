export default class Collection extends Array {
  static get [Symbol.species] () {
    return Object.assign(function (...items: any[]) {
      return Collection.from(Array.from(items))
    }, Collection)
  }
}
