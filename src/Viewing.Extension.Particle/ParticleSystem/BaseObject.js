import Vector from './Vector'

export default class BaseObject {

  constructor (id, type = 'object') {
    
    this.offset        = new Vector()
    this.position      = new Vector()
    this.selectable    = true
    this.transformable = true
    this.type          = type
    this.id            = id
  }

  setPosition (position) {

    this.position = position.add(this.offset)
  }
}
