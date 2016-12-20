import BaseObject from './BaseObject'
import Vector from './Vector'

export default class ParticleEmitter extends BaseObject {

  constructor (id) {

    super(id, 'emitter')

    this.spread       = 2 * Math.PI / 180
    this.emissionRate = 500
    this.velocity     = 10
    this.charge       = 1
  }

  emitNumber (dt) {

    return Math.floor(this.emissionRate * dt)
  }

  emitParticle (particle) {

    //inlining for perf

    //particle.velocity = this.ramdomVelocity()

    var angle1 = this.spread * (2 * Math.random() - 1)
    var angle2 = this.spread * (2 * Math.random() - 1)

    particle.velocity.x = this.velocity *
      Math.cos(angle1) * Math.cos(angle2)

    particle.velocity.y = this.velocity *
      Math.sin(angle1) * Math.cos(angle2)

    particle.velocity.z = this.velocity *
      Math.sin(angle2)

    particle.position.x = this.position.x
    particle.position.y = this.position.y
    particle.position.z = this.position.z

    particle.charge = this.charge
  }

  ramdomVelocity () {

    //random angles in [-spread, spread]
    var angle1 = this.spread * (2 * Math.random() - 1)
    var angle2 = this.spread * (2 * Math.random() - 1)

    return new Vector(
      this.velocity * Math.cos(angle1) * Math.cos(angle2),
      this.velocity * Math.sin(angle1) * Math.cos(angle2),
      this.velocity * Math.sin(angle2))
  }
}
