import ParticleSystem from './ParticleSystem/ParticleSystem'
import Vector from './ParticleSystem/Vector'
import EventsEmitter from 'EventsEmitter'
import Toolkit from 'Viewer.Toolkit'

export default class ParticleTool extends EventsEmitter {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, opts = {}){

    super()

    this.active = false

    this.viewer = viewer

    this.nbParticleTypes = 50

    this.objectMaterials =
      this.createObjectMaterials()

    this.particleMaterials =
      this.createRandomMaterials(
        this.nbParticleTypes)

    this.particleSystem = new ParticleSystem({
      maxParticles: opts.maxParticles || 0
    })

    this.onNewParticleHandler = (e)=>{

      this.onNewParticle(e)
    }

    this.particleSystem.on('particle.new', (e)=>{

      this.onNewParticleHandler(e)
    })

    this.onRecycleParticleHandler = (e)=>{

      this.onRecycleParticle(e)
    }

    this.particleSystem.on('particle.recycle', (e)=>{

      this.onRecycleParticleHandler(e)
    })

    this.onFilterParticleHandler = (e)=>{

      return this.onFilterParticle(e)
    }

    this.particleSystem.on('particle.filter', (e)=>{

      return this.onFilterParticleHandler(e)
    })

    this.onDestroyParticleHandler = (e)=>{

      return this.onDestroyParticle(e)
    }

    this.particleSystem.on('particle.destroy', (e)=>{

      return this.onDestroyParticleHandler(e)
    })
  }

  /////////////////////////////////////////////////////////////////
  // Tool names
  //
  /////////////////////////////////////////////////////////////////
  getNames() {

    return ["Viewing.Particle.Tool"]
  }

  /////////////////////////////////////////////////////////////////
  // Tool name
  //
  /////////////////////////////////////////////////////////////////
  getName() {

    return "Viewing.Particle.Tool"
  }

  /////////////////////////////////////////////////////////////////
  // Activate Tool
  //
  /////////////////////////////////////////////////////////////////
  activate() {

    console.log(this.getName() + ' activated')

    this.active = true

    this.t_last = 0
  }

  /////////////////////////////////////////////////////////////////
  // Deactivate tool
  //
  /////////////////////////////////////////////////////////////////
  deactivate() {

    console.log(this.getName() + ' deactivated')

    this.active = false

    this.particleSystem.destroy()

    this.viewer.impl.invalidate(true)
  }

  /////////////////////////////////////////////////////////////////
  // Load Scene settings from properties
  //
  /////////////////////////////////////////////////////////////////
  loadScene() {

    return new Promise((resolve, reject)=> {

      this.viewer.search('particle.scene', async(dbIds)=>{

        if (dbIds.length != 1)
          return reject('Invalid Particle scene')

        try {

          var propSettings = await Toolkit.getProperty(
            this.viewer.model, dbIds[0], 'particle.settings')

          var settings = JSON.parse(
            propSettings.displayValue)

          this.particleSystem.dof = Vector.fromArray(
            settings.dof)

          this.bounds = []

          for (var i = 1; i <= settings.bounds; ++i) {

            var propBounds = await Toolkit.getProperty(
              this.viewer.model, dbIds[0], 'particle.bound' + i)

            this.bounds.push(this.parseBound(propBounds))
          }

          var tasks = [
            this.loadEmitters(),
            this.loadObjects(),
            this.loadFields()
          ]

          return resolve(Promise.all(tasks))
        }
        catch (ex) {
          return reject(ex)
        }
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  // Parses scene bounds
  //
  /////////////////////////////////////////////////////////////////
  parseBound(propBound) {

    var bound = JSON.parse(propBound.displayValue)

    switch(bound.type) {

      case 'box':

        return {
          center: Vector.fromArray(bound.center),
          size: Vector.fromArray(bound.size),
          type: 'box'
        }

      case 'sphere':

        return {
          center: Vector.fromArray(bound.center),
          min: bound.min,
          max: bound.max,
          type: 'sphere'
        }
    }
  }

  /////////////////////////////////////////////////////////////////
  // Loads scene objects
  //
  /////////////////////////////////////////////////////////////////
  loadObject (dbId) {

    return new Promise(async(resolve, reject) => {

      try {

        var propSettings = await Toolkit.getProperty(
          this.viewer.model, dbId, 'particle.settings')

        var settings = JSON.parse(
          propSettings.displayValue)

        var color = parseInt(settings.clr, 16)

        var material = this.createMaterial({
          transparent: settings.transparent,
          opacity: settings.opacity,
          shading: THREE.FlatShading,
          name: Toolkit.guid(),
          shininess: 30,
          specular: color,
          color: color
        })

        Toolkit.setMaterial(
          this.viewer.model, dbId, material)

          return resolve()
      }
      catch (ex) {

        //throwing Invalid DbId
        //return reject(ex)
        return resolve()
      }
    })
  }

  loadObjects() {

    return new Promise((resolve, reject)=> {

      this.viewer.search('particle.object', (dbIds)=>{

        var tasks = dbIds.map((dbId)=> {

          return this.loadObject(dbId)
        })

        return resolve(Promise.all(tasks))
      })
    })
  }
  
  /////////////////////////////////////////////////////////////////
  // Load scene emitters
  //
  /////////////////////////////////////////////////////////////////
  loadEmitter(dbId){

    return new Promise(async(resolve, reject)=>{

      try {

        var bbox = await Toolkit.getWorldBoundingBox(
          this.viewer.model, dbId)

        var center = new Vector(
          (bbox.min.x + bbox.max.x) /2,
          (bbox.min.y + bbox.max.y) /2,
          (bbox.min.z + bbox.max.z) /2
        )

        var emitter = this.particleSystem.addEmitter(dbId)

        var propSettings = await Toolkit.getProperty(
          this.viewer.model, dbId, 'particle.settings')

        var settings = JSON.parse(
          propSettings.displayValue)

        emitter.offset = Vector.fromArray(settings.dir).scaled(0.5)
        emitter.direction = Vector.fromArray(settings.dir)
        emitter.transformable = settings.transfo
        emitter.emissionRate = settings.rate
        emitter.selectable = settings.select
        emitter.velocity = settings.velocity
        emitter.charge = settings.charge
        emitter.spread = settings.spread
        emitter.setPosition(center)

        var matIdx = emitter.charge < 0 ? 0 : 1

        var material = this.objectMaterials[matIdx]

        Toolkit.setMaterial(
          this.viewer.model,
          dbId, material)

        return resolve()
      }
      catch(ex){

        //throwing Invalid DbId
        //return reject(ex)
        return resolve()
      }
    })
  }

  loadEmitters() {
  
    return new Promise((resolve, reject)=> {

      this.viewer.search('particle.emitter', (dbIds)=>{

        var tasks = dbIds.map((dbId)=> {

          return this.loadEmitter(dbId)
        })

        return resolve(Promise.all(tasks))
      })
    })
  }
  
  /////////////////////////////////////////////////////////////////
  // Load scene fields
  //
  /////////////////////////////////////////////////////////////////
  loadField(dbId){
  
    return new Promise(async(resolve, reject)=>{

      try {

        var bbox = await Toolkit.getWorldBoundingBox(
          this.viewer.model, dbId)

        var center = new Vector(
          (bbox.min.x + bbox.max.x) /2,
          (bbox.min.y + bbox.max.y) /2,
          (bbox.min.z + bbox.max.z) /2
        )

        var field = this.particleSystem.addMagneticField(dbId)

        var propSettings = await Toolkit.getProperty(
          this.viewer.model, dbId,
          'particle.settings')

        var settings = JSON.parse(
          propSettings.displayValue)

        field.transformable = settings.transfo
        field.selectable = settings.select
        field.force = settings.force
        field.setPosition(center)

        var matIdx = field.force < 0 ? 0 : 1

        var material = this.objectMaterials[matIdx]

        Toolkit.setMaterial(
          this.viewer.model,
          dbId, material)

        return resolve()
      }
      catch(ex){

        //throwing Invalid DbId
        //return reject(ex)
        return resolve()
      }
    })
  }

  loadFields() {

    return new Promise((resolve, reject)=> {

      this.viewer.search('particle.field', (dbIds)=>{

        var tasks = dbIds.map((dbId)=> {

          return this.loadField(dbId)
        })

        return resolve(Promise.all(tasks))
      })
    })
  }

  /////////////////////////////////////////////////////////////////
  // Update object position
  //
  /////////////////////////////////////////////////////////////////
  async updateObjectPosition(dbId) {

    var bbox = await Toolkit.getWorldBoundingBox(
      this.viewer.model, dbId)

    var center = new Vector(
      (bbox.min.x + bbox.max.x) /2,
      (bbox.min.y + bbox.max.y) /2,
      (bbox.min.z + bbox.max.z) /2
    )

    var obj = this.particleSystem.getObjectById(dbId)

    obj.setPosition(center)
  }

  /////////////////////////////////////////////////////////////////
  // Creates object materials
  //
  /////////////////////////////////////////////////////////////////
  createObjectMaterials(){

    var materials = [

      this.createMaterial({
        shading: THREE.FlatShading,
        name: Toolkit.guid(),
        shininess: 80,
        specular: parseInt('B80000', 16),
        color: parseInt('B80000', 16)
      }),

      this.createMaterial({
        shading: THREE.FlatShading,
        name: Toolkit.guid(),
        shininess: 80,
        specular: parseInt('0000B8', 16),
        color: parseInt('0000B8', 16)
      })
    ]

    return materials
  }

  /////////////////////////////////////////////////////////////////
  // Creates a bunch of materials with random colors
  //
  /////////////////////////////////////////////////////////////////
  createRandomMaterials(nb){

    var materials = []

    for (var i = 0; i < nb; ++i) {

      var clr = Math.random() * 16777215

      materials.push(this.createMaterial({
        shading: THREE.FlatShading,
        name: Toolkit.guid(),
        shininess: 50,
        specular: clr,
        color: clr
      }))
    }

    return materials
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  setParticleTypes(nb){

    this.nbParticleTypes = nb

    this.particleMaterials =
      this.createRandomMaterials(
        this.nbParticleTypes)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onNewParticle(particle) {

    var type = randomInt(0, this.nbParticleTypes)

    particle.mesh = this.createMesh(
      particle.position,
      particle.radius,
      this.particleMaterials[type])
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onRecycleParticle(particle) {

    particle.mesh.visible = !particle.recycled

    if(particle.recycled){

      this.emit('particle.recycled')
    }
    else{

      var type = randomInt(0, this.nbParticleTypes)

      particle.mesh.material = this.particleMaterials[type]
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onDestroyParticle(particle) {

    this.viewer.impl.scene.remove(
      particle.mesh)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onFilterParticle(particle) {

    var result = true

    this.bounds.forEach((bound)=>{

      switch(bound.type){

        case 'sphere':

          if(bound.max){
            if(!particle.position.withinSphere(
                bound.center, bound.max)) {
              result = false
            }
          }

          if(bound.min){
            if(particle.position.withinSphere(
                bound.center, bound.min)) {
              result = false
            }
          }

          break

        case 'box':

          if(!particle.position.withinBox(
              bound.center, bound.size)) {
            result = false
          }

          break
      }
    })

    return result
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onObjectModified(event){

    switch(event.property){

      case 'charge':
      case 'force':

        // red material < 0
        // blue material >= 0
        var matIdx = event.value < 0 ? 0 : 1

        var material = this.objectMaterials[matIdx]

        Toolkit.setMaterial(
          this.viewer.model,
          event.object.id, material)

        break
    }
  }

  /////////////////////////////////////////////////////////////////
  // Update loop
  //
  /////////////////////////////////////////////////////////////////
  update(t) {

    var dt = t - this.t_last

    this.t_last = t

    this.particleSystem.step(dt * 0.001)

    this.particleSystem.particles.forEach((particle)=>{

      particle.mesh.position.x = particle.position.x
      particle.mesh.position.y = particle.position.y
      particle.mesh.position.z = particle.position.z
    })

    //needsClear, needsRender, overlayDirty)
    this.viewer.impl.invalidate(
      true, false, false)

    this.emit('fps.tick')
  }

  // version using requestAnimationFrame
  // instead of update()
  run() {

    var _this = this

    requestAnimationFrame(function(){
      _this.run()
    })

    _this.particleSystem.step(100 * 0.001)

    _this.particleSystem.particles.forEach((particle)=>{

      particle.mesh.position.set(
        particle.position.x,
        particle.position.y,
        particle.position.z)
    })

    //needsClear, needsRender, overlayDirty)
    _this.viewer.impl.invalidate(
      true, false, false)

    _this.emit('fps.tick')
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createMaterial(props) {

    var material = new THREE.MeshPhongMaterial(props)

    this.viewer.impl.matman().addMaterial(
      props.name,
      material,
      true)

    return material
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  createMesh(pos, size, material) {

    var geometry = new THREE.SphereGeometry(
      size, 4, 4)

    //var geometry = new THREE.BoxGeometry(
    //  size, size, size)

    var mesh = new THREE.Mesh(
      geometry,
      material)

    mesh.position.set(
      pos.x,
      pos.y,
      pos.z)

    this.viewer.impl.scene.add(mesh)

    return mesh
  }
}

// Random int in [min, max[
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}