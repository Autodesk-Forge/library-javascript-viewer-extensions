
export default class Vector {

  constructor (x, y, z) {
    this.x = x || 0
    this.y = y || 0
    this.z = z || 0
  }

  magnitude () {

    return Math.sqrt(
      this.x * this.x +
      this.y * this.y +
      this.z * this.z)
  }

  asUnitVector () {

    var m = this.magnitude()

    return new Vector(
      this.x / m,
      this.y / m,
      this.z / m)
  }

  scaled (scaleFactor) {

    var m = this.magnitude()

    return new Vector(
      this.x * scaleFactor / m,
      this.y * scaleFactor / m,
      this.z * scaleFactor / m)
  }

  multiply (scaleFactor) {

    this.x *= scaleFactor
    this.y *= scaleFactor
    this.z *= scaleFactor

    return this
  }

  add (vector) {

    this.x += vector.x
    this.y += vector.y
    this.z += vector.z

    return this
  }

  vectorTo (vector) {

    return new Vector(
      vector.x - this.x,
      vector.y - this.y,
      vector.z - this.z
    )
  }

  withinSphere (center, radius) {

    var magnitudeSqr =
      (this.x - center.x) * (this.x - center.x) +
      (this.y - center.y) * (this.y - center.y) +
      (this.z - center.z) * (this.z - center.z)

    return magnitudeSqr < radius * radius
  }

  withinBox (center, size) {

    //TODO

    return true
  }

  copy () {

    return new Vector(this.x, this.y, this.z)
  }

  static fromArray (data) {

    return new Vector(data[0], data[1], data[2])
  }
}
