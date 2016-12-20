
import Field from './Field'

export default class MagneticField extends Field {

  constructor (id) {

    super(id, 'field.magnetic')

    this.force = 0
  }

  applyForce (particle) {

    var dX = this.position.x - particle.position.x
    var dY = this.position.y - particle.position.y
    var dZ = this.position.z - particle.position.z

    var force = particle.charge * this.force / Math.pow((
      dX * dX +
      dY * dY +
      dZ * dZ), 1.5)

    if (Math.abs(force) > 0.001) {

      particle.acceleration.x += dX * force
      particle.acceleration.y += dY * force
      particle.acceleration.z += dZ * force
    }
  }
}