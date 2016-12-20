/////////////////////////////////////////////////////////////////////
// Viewing.Extension.CSSTVExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import BrowserScene from './scenes/BrowserScene'
import WeatherScene from './scenes/WeatherScene'
import IFrameScene from './scenes/IFrameScene'
import ExtensionBase from 'Viewer.ExtensionBase'
import './CSS3DRenderer'

class CSSTVExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super (viewer, options)

    this.onSelectionChangedHandler =
      (e) => this.onSelectionChanged(e)

    this.renderId = 0

    this.scenes = []
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId () {

    return '_Viewing.Extension.CSSTV'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load () {

    this.viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelectionChangedHandler)

    this.cssRenderer = new THREE.CSS3DRenderer()

    var $container = $(this._viewer.container)

    this.cssRenderer.setSize(
      $container.width(),
      $container.height())

    $(this.cssRenderer.domElement)
      .css('pointer-events', 'none')
      .css('position', 'absolute')
      .css('top', '0px')
      .css('left', '0px')
      .css('z-index', 1)
      .appendTo($container)

    this.render()

    $(window).resize(() => {

      this.onResize()
    })

    console.log('Viewing.Extension.CSSTV loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onResize () {

    var $container = $(this._viewer.container)

    this.cssRenderer.setSize(
      $container.width(),
      $container.height())
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render () {

    var camera = this._viewer.navigation.getCamera()

    this.scenes.forEach((scene) => {

      this.cssRenderer.render(
        scene.glScene, camera)
    })

    this.renderId = window.requestAnimationFrame(() => {
      this.render()
    })
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload () {

    this.viewer.removeEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onSelectionChangedHandler)

    console.log('Viewing.Extension.CSSTV unloaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // SELECTION_CHANGED_EVENT Handler
  //
  /////////////////////////////////////////////////////////////////
  onSelectionChanged (event) {

    if (event.selections.length) {

      var selection = event.selections[0]

      //Button OFF: [52, 53]
      this.checkSelection(selection.dbIdArray, 100, 101, () => {
        this.onButtonClicked(0)
      })

      //Button1: [52, 53]
      this.checkSelection(selection.dbIdArray, 52, 53, () => {
        this.onButtonClicked(1)
      })

      //Button2: [54, 55]
      this.checkSelection(selection.dbIdArray, 54, 55, () => {
        this.onButtonClicked(2)
      })

      //Button3: [56, 57]
      this.checkSelection(selection.dbIdArray, 56, 57, () => {
        this.onButtonClicked(3)
      })

      //Button4: [62, 63]
      this.checkSelection(selection.dbIdArray, 62, 63, () => {
        this.onButtonClicked(4)
      })

      //Button5: [60, 61]
      this.checkSelection(selection.dbIdArray, 60, 61, () => {
        this.onButtonClicked(5)
      })
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  checkSelection (dbIdArray, id1, id2, handler) {

    if (dbIdArray.indexOf(id1) > -1 &&
       dbIdArray.indexOf(id2) < 0) {

      this._viewer.select([id1, id2])
      handler()
    }

    if (dbIdArray.indexOf(id2) > -1 &&
       dbIdArray.indexOf(id1) < 0) {

      this._viewer.select([id1, id2])
      handler()
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onButtonClicked (btnId) {

    switch (btnId) {

      case 0:

        this.clearScenes()
        return

      case 1:

        this.clearScenes()

        var weatherScene = new WeatherScene()

        this.scenes = [ weatherScene ]

        if (this.renderId === 0) {
          this.render()
        }

        break

      case 2:

        this.clearScenes()

        var browserScene = new BrowserScene(
          'https://forge.autodesk.io')

        this.scenes = [ browserScene ]

        if (this.renderId === 0) {
          this.render()
        }

        break

      case 3:

        this.clearScenes()

        var iFrameScene = new IFrameScene(
          'https://lmv-react.herokuapp.com/embed?id=560c6c57611ca14810e1b2bf')

        this.scenes = [iFrameScene]

        if (this.renderId === 0) {
          this.render()
        }

        break
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  clearScenes () {

    window.cancelAnimationFrame(this.renderId)

    this.renderId = 0

    this.scenes.forEach((scene) => {

      scene.clear()
    })

    this.scenes = []
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  CSSTVExtension.ExtensionId,
  CSSTVExtension)
