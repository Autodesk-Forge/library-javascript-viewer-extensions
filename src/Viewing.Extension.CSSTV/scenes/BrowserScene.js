import ViewerToolkit from 'Viewer.Toolkit'
import './styles.css'

export default class BrowserScene {

  constructor (defaultUrl) {

    this.sceneId = ViewerToolkit.guid()

    this.iFrameId = ViewerToolkit.guid()

    this.inputId = ViewerToolkit.guid()

    this.glScene = new THREE.Scene()

    var html = `
      <div id="${this.sceneId}" class="browser-scene">
        <div class="address-bar">
          <input id="${this.inputId}" type="text" class="input-url">
        </div>
        <iframe id="${this.iFrameId}" src="${defaultUrl}"
              width="1430px"
              height="770px"
              frameBorder="0">
        </iframe>
      </div>
    `

    var $html = $(html)

    var cssObj = new THREE.CSS3DObject($html[0])

    cssObj.position.set(
      -16.63 + 22.35,
      15.25 - 12.5,
      7.90)

    cssObj.scale.set(
      0.03, 0.03, 0.03)

    this.glScene.add(cssObj)

    setTimeout(() => {

      $('#' + this.inputId).keyup((e) => {

        if(e.keyCode === 13) {

          var url = $('#' + this.inputId).val()

          $('#' + this.iFrameId).attr('src', url)
        }
      })
    }, 1000)
  }

  clear () {

    $(`#${this.sceneId}`).remove()
  }
}