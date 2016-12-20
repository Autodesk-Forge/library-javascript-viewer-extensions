import Vector from './Vector'

export default class Particle {

  constructor (dof) {
    this.velocity     = new Vector()
    this.position     = new Vector()
    this.acceleration = new Vector()
    this.recycled     = false
    this.radius       = 0.03
    this.dof          = dof
    this.lifeTime     = 30
    this.charge       = 1
  }

  reset () {
    this.recycled = false
    this.lifeTime = 30
  }

  submitToFields (fields) {

    this.acceleration.x = 0
    this.acceleration.y = 0
    this.acceleration.z = 0

    fields.forEach((field) => {

      field.applyForce(this)
    })
  }

  step (dt) {

    this.lifeTime -= dt

    if (this.dof.x) {
      this.velocity.x += this.acceleration.x * dt
      this.position.x += this.velocity.x * dt
    }

    if (this.dof.y) {
      this.velocity.y += this.acceleration.y * dt
      this.position.y += this.velocity.y * dt
    }

    if (this.dof.z) {
      this.velocity.z += this.acceleration.z * dt
      this.position.z += this.velocity.z * dt
    }
  }
}

