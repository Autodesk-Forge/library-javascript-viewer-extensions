/////////////////////////////////////////////////////////////////////
// Viewing.Extension.ModelTransfomerExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import Panel from './Viewing.Extension.ModelTransformer.Panel'
import ExtensionBase from 'Viewer.ExtensionBase'
import ViewerToolkit from 'Viewer.Toolkit'

class ModelTransformerExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options) {

    super(viewer, options)

    this.firstModelLoaded = null

    this.modelCollection = {}

    this.onGeometryLoadedHandler = (e) => {

      this.onGeometryLoaded(e)
    }

    this.onAggregateSelectionChangedHandler = (e) => {

      this.onAggregateSelectionChanged(e)
    }

    this.selectedDbIdArray = []
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId () {

    return 'Viewing.Extension.ModelTransformer'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load () {

    this.loadControls()

    const hotkeyMng = Autodesk.Viewing.theHotkeyManager

    this.hotkeysId = ExtensionBase.guid()

    const hotKeyTranslate = {

      keycodes: [
        hotkeyMng.KEYCODES.t
      ],
      onPress: (hotkeys) => {
        //handled
        return true
      },
      onRelease: (hotkeys) => {

        var hitPoint = null

        if (this.panel.rxTool.active) {

          hitPoint = this.panel.rxTool.hitPoint()

          this._viewer.toolController.deactivateTool(
            this.panel.rxTool.getName())
        }

        if (!this.panel.txTool.active) {

          this._viewer.toolController.activateTool(
            this.panel.txTool.getName())

          if (hitPoint) {

            this.panel.txTool.setHitPoint(hitPoint)

            const selections =
              this._viewer.getAggregateSelection()

            if (selections.length) {

              const model = selections[0].model

              const dbIdArray = selections[0].selection

              ViewerToolkit.getFragIds(
                model, dbIdArray).then((fragIdsArray) => {

                  this.panel.txTool.setSelection({
                    fragIdsArray,
                    dbIdArray,
                    model
                  })
                })
            }
          }
        }

        return true
      }
    }

    const hotKeyRotate = {

      keycodes: [
        hotkeyMng.KEYCODES.r
      ],
      onPress: (hotkeys) => {
        //handled
        return true
      },
      onRelease: (hotkeys) => {

        var hitPoint = null

        if (this.panel.txTool.active) {

          hitPoint = this.panel.txTool.hitPoint()

          this._viewer.toolController.deactivateTool(
            this.panel.txTool.getName())
        }

        if (!this.panel.rxTool.active) {

          this._viewer.toolController.activateTool(
            this.panel.rxTool.getName())

          if (hitPoint) {

            this.panel.rxTool.setHitPoint(hitPoint)

            const selections =
              this._viewer.getAggregateSelection()

            if (selections.length) {

              const model = selections[0].model

              const dbIdArray = selections[0].selection

              ViewerToolkit.getFragIds(
                model, dbIdArray).then((fragIdsArray) => {

                  this.panel.rxTool.setSelection({
                    fragIdsArray,
                    dbIdArray,
                    model
                  })
                })
            }
          }
        }

        return true
      }
    }

    hotkeyMng.pushHotkeys(
      this.hotkeysId, [
          hotKeyTranslate,
          hotKeyRotate
        ], {
        tryUntilSuccess: true
      })

    this._viewer.addEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      this.onGeometryLoadedHandler)

    this._viewer.addEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onAggregateSelectionChangedHandler)

    console.log('Viewing.Extension.ModelTransformer loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  loadControls () {

    this.control = ViewerToolkit.createButton(
      'toolbar-model-transformer',
      'adsk-button-icon model-transformer-icon fa fa-gears',
      'Transform Models', () => {

        this.panel.toggleVisibility()
      })

    this.panel = new Panel(
      this._viewer,
      this.control.container)

    this.panel.on('open', () => {

      if(this._options.autoLoad) {

        var loadedModels = this._viewer.impl.modelQueue().getModels()

        loadedModels.forEach((model) => {

          model.modelId = model.modelId || ExtensionBase.guid()

          if (!this.modelCollection[ model.modelId ]) {

            model.name = model.name ||
            'Model ' + (Object.keys(this.modelCollection).length + 1)

            this.addModel(model)
          }
        })
      }
    })

    this.panel.on('model.transform', (data) => {

      data.model.transform = data.transform

      this.applyTransform(data.model)

      this._viewer.impl.sceneUpdated(true)

      if (data.fitToView) {

        this.fitModelToView(data.model)
      }
    })

    this.panel.on('model.delete', (data) => {

      this.deleteModel(
        data.model)

      this._viewer.impl.sceneUpdated(true)
    })

    this.panel.on('model.selected', (data) => {

      this.currentSelection = data.selection

      if (data.fitToView) {

        this.fitModelToView(data.model)
      }
    })

    if (this._options.parentControl) {

      if(typeof this._options.parentControl === 'string') {

        this.parentControl = this._viewer.getToolbar().getControl(
          this._options.parentControl)

      } else if (typeof this._options.parentControl === 'object') {

        this.parentControl = this._options.parentControl
      }

    } else {

      var viewerToolbar = this._viewer.getToolbar(true)

      this.parentControl = new Autodesk.Viewing.UI.ControlGroup(
        'model-transformer')

      viewerToolbar.addControl(this.parentControl)
    }

    if (this.parentControl) {

      this.parentControl.addControl(
        this.control)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onGeometryLoaded (e) {

    if(this._options.autoLoad) {

      var model = e.target.model

      model.modelId = model.modelId || ExtensionBase.guid()

      if (!this.modelCollection[ model.modelId ]) {

        model.name = model.name ||
        'Model ' + (Object.keys(this.modelCollection).length + 1)

        this.addModel(model)
      }
    }
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload () {

    Autodesk.Viewing.theHotkeyManager.popHotkeys(
      this.hotkeysId)

    this._viewer.removeEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      this.onGeometryLoadedHandler)

    this._viewer.removeEventListener(
      Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
      this.onAggregateSelectionChangedHandler)

    if (this.control) {

      this.parentControl.removeControl(
        this.control)
    }

    console.log('Viewing.Extension.ModelTransfomer unloaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Fix model structure when selecting model
  //
  /////////////////////////////////////////////////////////////////
  onAggregateSelectionChanged (event) {

    if (event.selections && event.selections.length) {

      var selection = event.selections[0]

      this.selectedDbIdArray = event.selections[0].dbIdArray

      this.setStructure(selection.model)
    }
  }

  /////////////////////////////////////////////////////////////////
  // Applies transform to specific model
  //
  /////////////////////////////////////////////////////////////////
  applyTransform (model) {

    var viewer = this._viewer

    var euler = new THREE.Euler(
      model.transform.rotation.x * Math.PI/180,
      model.transform.rotation.y * Math.PI/180,
      model.transform.rotation.z * Math.PI/180,
      'XYZ')

    var quaternion = new THREE.Quaternion()

    quaternion.setFromEuler(euler)

    function _transformFragProxy (fragId) {

      var fragProxy = viewer.impl.getFragmentProxy(
        model,
        fragId)

      fragProxy.getAnimTransform()

      fragProxy.position = model.transform.translation

      fragProxy.scale = model.transform.scale

      //Not a standard three.js quaternion
      fragProxy.quaternion._x = quaternion.x
      fragProxy.quaternion._y = quaternion.y
      fragProxy.quaternion._z = quaternion.z
      fragProxy.quaternion._w = quaternion.w

      fragProxy.updateAnimTransform()
    }

    var fragCount = model.getFragmentList().
      fragments.fragId2dbId.length

    //fragIds range from 0 to fragCount-1
    for (var fragId = 0; fragId < fragCount; ++fragId) {

      _transformFragProxy(fragId)
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  fitModelToView (model) {

    var instanceTree = model.getData().instanceTree

    if (instanceTree) {

      var rootId = instanceTree.getRootId()

      this._viewer.model = model

      this._viewer.fitToView([rootId])
    }
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  setStructure (model) {

    var instanceTree = model.getData().instanceTree

    if (instanceTree && this._viewer.modelstructure) {

      this._viewer.modelstructure.setModel(
        instanceTree)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  addModel (model) {

    this.modelCollection[model.modelId] = model

    if (!model.transform) {

      model.transform = {
        scale: {
          x: 1.0, y: 1.0, z: 1.0
        },
        translation: {
          x: 0.0, y: 0.0, z: 0.0
        },
        rotation: {
          x: 0.0, y: 0.0, z: 0.0
        }
      }
    }

    this.panel.dropdown.addItem(
      model, true)
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  modelTransformToMatrix (transform) {

    var matrix = new THREE.Matrix4()

    var translation = new THREE.Vector3(
      transform.translation.x,
      transform.translation.y,
      transform.translation.z)

    var euler = new THREE.Euler(
      transform.rotation.x * Math.PI / 180,
      transform.rotation.y * Math.PI / 180,
      transform.rotation.z * Math.PI / 180,
      'XYZ')

    var quaternion = new THREE.Quaternion()

    quaternion.setFromEuler(euler)

    var scale = new THREE.Vector3(
      transform.scale.x,
      transform.scale.y,
      transform.scale.z)

    matrix.compose(translation, quaternion, scale)

    return matrix
  }

  //////////////////////////////////////////////////////////////////////////
  //
  //
  //////////////////////////////////////////////////////////////////////////
  buildPlacementTransform (modelName) {

    var placementTransform = new THREE.Matrix4()

    if (!this.firstModelLoaded) {

      this.firstModelLoaded = modelName
    }

    // those file type have different orientation
    // than other, so need to correct it
    // upon insertion
    const zOriented = ['rvt', 'nwc']

    var firstExt = this.firstModelLoaded.split('.').pop(-1)

    var modelExt = modelName.split(".").pop(-1)

    if (zOriented.indexOf(firstExt) > -1) {

      if (zOriented.indexOf(modelExt) < 0) {

        placementTransform.makeRotationX(
          90 * Math.PI/180)
      }

    } else {

      if(zOriented.indexOf(modelExt) > -1) {

        placementTransform.makeRotationX(
          -90 * Math.PI/180)
      }
    }

    return placementTransform
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  deleteModel (model, fireEvent = true) {

    delete this.modelCollection[model.modelId]

    if(Object.keys(this.modelCollection).length === 0){

      this.firstModelLoaded = null
    }

    if(fireEvent) {

      this.emit('model.delete', model)
    }

    this._viewer.impl.unloadModel(model)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  clearModels () {

    this.panel.clearSelection()

    this.panel.dropdown.clear()

    this.modelCollection = {}
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  ModelTransformerExtension.ExtensionId,
  ModelTransformerExtension)
