/////////////////////////////////////////////////////////////////////
//
//
//
/////////////////////////////////////////////////////////////////////
import TranslateTool from './Viewing.Tool.Translate'
import './Viewing.Extension.ModelTransformer.scss'
import RotateTool from './Viewing.Tool.Rotate'
import ViewerTooltip from 'Viewer.Tooltip'
import ToolPanelBase from 'ToolPanelBase'
import SwitchButton from 'SwitchButton'
import Dropdown from 'Dropdown'

export default class ModelTransformerPanel extends ToolPanelBase {

  constructor(viewer, btnElement) {

    super(viewer.container, 'Transform Models', {
      buttonElement: btnElement,
      closable: true,
      movable: true,
      shadow: true
    })

    $(this.container).addClass('model-transformer')

    this.dropdown = new Dropdown({
      container: '#' + this.dropdownContainerId,
      title: 'Select Model',
      prompt: 'Select Model ...',
      pos: {
        top: 0, left: 0
      }
    })

    this.dropdown.on('item.selected', (model) => {

      this.currentModel = model

      if (model) {

        this.setTransform(model.transform)

        this.emit('model.selected', {
          fitToView: true,
          model
        })
      }
    })

    var applyTransform = (model, fitToView = false) => {

      this.txTool.clearSelection()
      this.rxTool.clearSelection()

      if (model) {

        this.emit('model.transform', {

          model: model,

          fitToView,

          transform: {
            translation: this.getTranslation(),
            rotation: this.getRotation(),
            scale: this.getScale()
          }
        })
      }
    }

    this.fullTransformSwitch = new SwitchButton(
      `#${this.container.id}-full-transform-switch`)

    this.fullTransform = true

    this.fullTransformSwitch.on('checked', (checked) => {

      this.txTool.fullTransform = checked
      this.rxTool.fullTransform = checked
      this.fullTransform = checked

      this.txTool.clearSelection()
      this.rxTool.clearSelection()
    })

    $(`#${this.container.id}-unload-btn`).click(() => {

      this.txTool.clearSelection()

      if (this.currentModel) {

        this.emit('model.delete', {

          model: this.currentModel
        })

        this.dropdown.removeCurrentItem()
      }
    })

    this.viewer = viewer

    this.txTool = new TranslateTool(viewer)
    this.rxTool = new RotateTool(viewer)

    this.txTool.fullTransform = true
    this.rxTool.fullTransform = true

    this.viewer.toolController.registerTool(this.txTool)
    this.viewer.toolController.registerTool(this.rxTool)

    this.txTool.on('transform.translate', (data) => {

      data.model.transform.translation = data.translation

      this.setTranslation(
        data.model.transform.translation)
    })

    this.rxTool.on('transform.rotate', (data) => {

      data.model.transform.rotation = data.rotation

      this.setRotation({
        x: (data.rotation.x * 180 / Math.PI) % 360,
        y: (data.rotation.y * 180 / Math.PI) % 360,
        z: (data.rotation.z * 180 / Math.PI) % 360
      })
    })

    var onModelSelected = (selection) => {

      $('#' + this.transPickBtnId).prop(
        'disabled', !this.txTool.active)

      this.dropdown.setCurrentItem(selection.model)

      this.setTransform(selection.model.transform)

      this.currentModel = selection.model

      this.emit('model.selected', {
        model: selection.model,
        fitToView: false
      })

      this.tooltip.deactivate()
    }

    this.txTool.on('transform.modelSelected',
      onModelSelected)

    this.txTool.on('transform.clearSelection', () => {

      $('#' + this.transPickBtnId).prop(
        'disabled', true)

      this.tooltip.deactivate()
    })

    this.rxTool.on('transform.modelSelected',
      onModelSelected)

    this.on('open', () => {

      this.viewer.toolController.activateTool(
        this.txTool.getName())
    })

    this.on('close', () => {

      this.viewer.toolController.deactivateTool(
        this.txTool.getName())

      this.viewer.toolController.deactivateTool(
        this.rxTool.getName())

      $('#' + this.transPickBtnId).prop(
        'disabled', true)
    })

    $('.model-transformer .trans, ' +
      '.model-transformer .rot').on(
      'change keyup input paste', ()=>{

        applyTransform(this.currentModel)
    })

    $('.model-transformer .trans').on(
      'focus', () => {

        this.viewer.toolController.deactivateTool(
          this.rxTool.getName())

        this.viewer.toolController.activateTool(
          this.txTool.getName())
    })

    $('.model-transformer .rot').on(
      'focus', () => {

        this.viewer.toolController.deactivateTool(
          this.txTool.getName())

        this.viewer.toolController.activateTool(
          this.rxTool.getName())
    })

    $(`#${this.container.id}-Sx`).on('change keyup', () => {

      var scale = $(`#${this.container.id}-Sx`).val()

      $(`#${this.container.id}-Sy`).val(scale)
      $(`#${this.container.id}-Sz`).val(scale)

      applyTransform(this.currentModel, true)
    })

    $('#' + this.transPickBtnId).click(() => {

      this.txTool.onPick()

      this.tooltip.activate()
    })

    this.tooltip = new ViewerTooltip(viewer)

    this.tooltip.setContent(`
      <div id="pickTooltipId" class="pick-tooltip">
        <b>Pick position ...</b>
      </div>`, '#pickTooltipId')
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent(id) {

    this.dropdownContainerId = ToolPanelBase.guid()

    this.transPickBtnId = ToolPanelBase.guid()

    return `

      <div class="container">

        <div id="${this.dropdownContainerId}">
        </div>

        <hr class="v-spacer">

        <div>

          <span class="text-span">
            Translation:
          </span>

          <hr class="v-spacer">

          <button id="${this.transPickBtnId}"
            class="btn btn-trans-pick" disabled>
            <span class="glyphicon glyphicon-screenshot btn-span">
            </span>
          </button>

          <input id="${id}-Tx" type="text"
            class="input numeric trans"
            placeholder="  x (0.0)">

          <input id="${id}-Ty" type="text"
            class="input numeric trans"
            placeholder="  y (0.0)">

          <input id="${id}-Tz" type="text"
            class="input numeric trans"
            placeholder="  z (0.0)">

          <hr class="v-spacer">

          <span class="text-span">
            Rotation (deg):
          </span>

          <hr class="v-spacer">

          <input id="${id}-Rx" type="text"
            class="input numeric rot"
            placeholder="  x (0.0)">

          <input id="${id}-Ry" type="text"
            class="input numeric rot"
            placeholder="  y (0.0)">

          <input id="${id}-Rz" type="text"
            class="input numeric rot"
            placeholder="  z (0.0)">

          <span class="text-span">
            Scale:
          </span>

          <hr class="v-spacer">

          <input id="${id}-Sx" type="text"
            class="input numeric scale"
            placeholder="  x (1.0)">

          <input id="${id}-Sy" type="text"
            class="input numeric scale"
            placeholder="  y (1.0)">

          <input id="${id}-Sz" type="text"
            class="input numeric scale"
            placeholder="  z (1.0)">

          <hr class="v-spacer-large">

        </div>

        <div style="margin-top:8px">

          <div style="color:white;">
          Full Model Transform
            <div id="${id}-full-transform-switch"
              style="float:left; margin-right:8px;">
            </div>
          </div>

          <hr class="v-spacer-large">

          <button class="btn btn-danger" id="${id}-unload-btn">
            <span class="glyphicon glyphicon-save-file btn-span">
            </span>
             Unload Model
          </button>
        </div>

      </div>`
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setTransform (transform) {

    $(`#${this.container.id}-Tx`).val(transform.translation.x.toFixed(2))
    $(`#${this.container.id}-Ty`).val(transform.translation.y.toFixed(2))
    $(`#${this.container.id}-Tz`).val(transform.translation.z.toFixed(2))

    $(`#${this.container.id}-Rx`).val(transform.rotation.x.toFixed(2))
    $(`#${this.container.id}-Ry`).val(transform.rotation.y.toFixed(2))
    $(`#${this.container.id}-Rz`).val(transform.rotation.z.toFixed(2))

    $(`#${this.container.id}-Sx`).val(transform.scale.x)
    $(`#${this.container.id}-Sy`).val(transform.scale.y)
    $(`#${this.container.id}-Sz`).val(transform.scale.z)
  }

  /////////////////////////////////////////////////////////////
  // Gets input transform
  //
  /////////////////////////////////////////////////////////////
  getScale () {

    var x = parseFloat($(`#${this.container.id}-Sx`).val())
    var y = parseFloat($(`#${this.container.id}-Sy`).val())
    var z = parseFloat($(`#${this.container.id}-Sz`).val())

    x = isNaN(x) ? 1.0 : x
    y = isNaN(y) ? 1.0 : y
    z = isNaN(z) ? 1.0 : z

    return new THREE.Vector3(x, y, z)
  }

  getTranslation () {

    var x = parseFloat($(`#${this.container.id}-Tx`).val())
    var y = parseFloat($(`#${this.container.id}-Ty`).val())
    var z = parseFloat($(`#${this.container.id}-Tz`).val())

    x = isNaN(x) ? 0.0 : x
    y = isNaN(y) ? 0.0 : y
    z = isNaN(z) ? 0.0 : z

    return new THREE.Vector3(x, y, z)
  }

  getRotation () {

    var x = parseFloat($(`#${this.container.id}-Rx`).val())
    var y = parseFloat($(`#${this.container.id}-Ry`).val())
    var z = parseFloat($(`#${this.container.id}-Rz`).val())

    x = isNaN(x) ? 0.0 : x
    y = isNaN(y) ? 0.0 : y
    z = isNaN(z) ? 0.0 : z

    return new THREE.Vector3(x, y, z)
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  setScale (scale) {

    $(`#${this.container.id}-Sx`).val(scale.x.toFixed(2))
    $(`#${this.container.id}-Sy`).val(scale.y.toFixed(2))
    $(`#${this.container.id}-Sz`).val(scale.z.toFixed(2))
  }
  
  setTranslation (translation) {

    $(`#${this.container.id}-Tx`).val(translation.x.toFixed(2))
    $(`#${this.container.id}-Ty`).val(translation.y.toFixed(2))
    $(`#${this.container.id}-Tz`).val(translation.z.toFixed(2))
  }

  setRotation (rotation) {

    $(`#${this.container.id}-Rx`).val(rotation.x.toFixed(2))
    $(`#${this.container.id}-Ry`).val(rotation.y.toFixed(2))
    $(`#${this.container.id}-Rz`).val(rotation.z.toFixed(2))
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  clearSelection () {

    this.txTool.clearSelection()
    this.rxTool.clearSelection()
  }
}