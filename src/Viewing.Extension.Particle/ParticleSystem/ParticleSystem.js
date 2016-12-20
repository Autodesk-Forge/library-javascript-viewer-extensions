import ParticleEmitter from './ParticleEmitter'
import MagneticField from './MagneticField'
import EventsEmitter from 'EventsEmitter'
import Particle from './Particle'

export default class ParticleSystem extends EventsEmitter {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor (opts) {

    super()

    this.dof = opts.dof || { x: 1, y: 1, z: 1 }
    this.maxParticles = opts.maxParticles
    this.emittedParticles = 0
    this.recycleBin = []
    this.particles = []
    this.emitters = []
    this.fields = []
  }

  ///////////////////////////////////////////////////////////////////
  // Returns object by id
  //
  ///////////////////////////////////////////////////////////////////
  getObjectById (id) {

    for (var emitters of this.emitters) {
      if (emitters.id === id) {
        return emitters
      }
    }

    for (var fields of this.fields) {
      if (fields.id === id) {
        return fields
      }
    }

    return null
  }

  ///////////////////////////////////////////////////////////////////
  // clean up all objects and fire 'particle.destroy'
  // for each particle
  //
  ///////////////////////////////////////////////////////////////////
  destroy () {

    this.particles.forEach((particle) => {

      this.emit('particle.destroy', particle)
    })

    this.recycleBin = []
    this.particles = []
  }

  ///////////////////////////////////////////////////////////////////
  // Adds emitter object
  //
  ///////////////////////////////////////////////////////////////////
  addEmitter (id) {

    var emitter = new ParticleEmitter(id)

    this.emitters.push(emitter)

    return emitter
  }

  ///////////////////////////////////////////////////////////////////
  // Adds magnetic field object
  //
  ///////////////////////////////////////////////////////////////////
  addMagneticField (id) {

    var field = new MagneticField(id)

    this.fields.push(field)

    return field
  }

  ///////////////////////////////////////////////////////////////////
  // updates simulation
  //
  ///////////////////////////////////////////////////////////////////
  step (dt) {

    this.addNewParticles(dt)
    this.filterParticles(dt)
  }

  ///////////////////////////////////////////////////////////////////
  // add new particles step
  //
  ///////////////////////////////////////////////////////////////////
  addNewParticles (dt) {
    this.emitters.forEach((emitter) => {
      for (var i = 0; i < emitter.emitNumber(dt); ++i) {
        var particle = this.popRecycle()
        if (particle) {
          emitter.emitParticle(particle)
        }
      }
    })
  }

  ///////////////////////////////////////////////////////////////////
  // push a particle to recycle bin
  //
  ///////////////////////////////////////////////////////////////////
  pushRecycle (particle) {

    --this.emittedParticles

    particle.recycled = true

    this.emit('particle.recycle',
      particle)

    this.recycleBin.push(
      particle)
  }

  ///////////////////////////////////////////////////////////////////
  // pop a particle from recycle bin
  //
  ///////////////////////////////////////////////////////////////////
  popRecycle () {

    if (this.emittedParticles > this.maxParticles - 1) {
      return null
    }

    ++this.emittedParticles

    var particle = this.recycleBin.pop()

    if (particle) {

      particle.reset()

      this.emit('particle.recycle',
        particle)

      return particle
    }

    particle = new Particle(this.dof)

    this.emit('particle.new', particle)
    this.particles.push(particle)

    return particle
  }

  ///////////////////////////////////////////////////////////////////
  // filter particles using lifeTime and event callback
  //
  ///////////////////////////////////////////////////////////////////
  filterParticle (particle) {

    if (particle.recycled) {
      return false
    }

    if (particle.lifeTime < 0) {
      this.pushRecycle(particle)
      return false
    }

    var filter = this.emit(
      'particle.filter',
      particle)

    if (filter !== undefined) {
      if (!filter) {
        this.pushRecycle(particle)
      }
      return filter
    }

    return true
  }

  ///////////////////////////////////////////////////////////////////
  // filter particles step
  //
  ///////////////////////////////////////////////////////////////////
  filterParticles (dt) {

    this.particles.forEach((particle) => {

      if (this.filterParticle(particle)) {

        particle.submitToFields(this.fields)
        particle.step(dt)
      }
    })
  }
}

