
import ToolPanelBase from 'ToolPanelBase'
import './Viewing.Extension.Particle.css'
import dat from 'dat-gui'

export default class ParticlePanel extends ToolPanelBase {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor (particleTool, viewer, btnElement) {
    
    super(viewer.container, 'Particle Controls', {
      buttonElement: btnElement,
      closable: false
    })

    this._viewer = viewer

    $(this.container).addClass('particle')

    var gui = new dat.GUI({
      autoPlace: false
    })

    var guiContainer = document.getElementById(
      this.container.id + '-gui')

    guiContainer.appendChild(
      gui.domElement)

    var folder = gui.addFolder('Particle System Properties')

    this.maxParticleCtrl = folder.add(
      particleTool.particleSystem,
      'maxParticles', 0, 10000).name(
        'Max Particles')

    this.maxParticleCtrl.onFinishChange((value) => {

      this.emit('maxParticles.changed', value)
    })

    var nbParticleTypes = folder.add(particleTool,
      'nbParticleTypes', 1, 200).name(
        'Particle Types')

    nbParticleTypes.onFinishChange(function (nbTypes) {
      particleTool.setParticleTypes(
        Math.max(1, Math.floor(nbTypes)))
    })

    folder.open()

    setTimeout(() => {
      gui.domElement.style.width = '100%'
    }, 0)
  }
  
  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent (id) {
    
    return `
     <div class="container">
          <div id="${id}-gui">
          </div>
      </div>`
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  loadObjectGUI (obj) {

    $('#' + this.container.id + '-obj-gui').remove()

    if (!obj || !obj.selectable) {
      return
    }

    var gui = new dat.GUI({
      autoPlace: false
    })

    $('#' + this.container.id + '-gui').append(
      `<div id="${this.container.id}-obj-gui"></div>`
    )

    var guiContainer = document.getElementById(
      this.container.id + '-obj-gui')

    guiContainer.appendChild(
      gui.domElement)

    switch (obj.type) {

      case 'field.magnetic':

        var fieldFolder = gui.addFolder('Selected Field Properties')

        var forceCtrl = fieldFolder.add(
          obj, 'force', -100, 100).name('Force')

        forceCtrl.onChange((value) => {

          this.emit('objectModified', {
            property: 'force',
            value: value,
            object: obj
          })
        })

        fieldFolder.open()
        break

      case 'emitter':

        var emitterFolder = gui.addFolder('Selected Emitter Properties')

        emitterFolder.add(obj, 'emissionRate', 10, 1000).name('Emission Rate')
        emitterFolder.add(obj, 'spread', 0.0, 6 * Math.PI / 180).name('Spread')
        emitterFolder.add(obj, 'velocity', 1, 10).name('Particles Velocity')

        var chargeCtrl = emitterFolder.add(
          obj, 'charge', -10, 10).name('Particles Charge')

        chargeCtrl.onChange((value) => {

          this.emit('objectModified', {
            property: 'charge',
            value: value,
            object: obj
          })
        })

        emitterFolder.open()
        break

      default:
        break
    }

    window.setTimeout(() => {
      gui.domElement.style.width = '100%'
    }, 0)

    this.setVisible(true)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setSelected (obj) {

    this.loadObjectGUI(obj)
  }
}