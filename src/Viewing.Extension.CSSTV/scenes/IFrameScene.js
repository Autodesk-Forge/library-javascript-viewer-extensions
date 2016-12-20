import ViewerToolkit from 'Viewer.Toolkit'

export default class IFrameScene {

  constructor (url) {

    this.glScene = new THREE.Scene()

    this.sceneId = ViewerToolkit.guid()

    //Vertex: [-16.63, 15.25, 7.90]
    //Vertex: [28.11, 15.25, 7.90]
    //Vertex: [28.11, -9.69, 7.90]
    //Vertex: [-16.63, -9.69, 7.90]

    var $iframe = $(document.createElement('iframe'))
      .attr('id', this.sceneId)
      .attr('src', url)
      .attr('class', 'css-render')
      .attr('width', '1430px')
      .attr('height', '800px')
      .attr('frameBorder', '0')
      .css('display', 'block')
      .css('display', 'block')
      .css('pointer-events', 'auto') // not none

    var cssObj = new THREE.CSS3DObject($iframe[0])

    cssObj.position.set(
      -16.63 + 22.35,
      15.25 - 12.5,
      7.90)

    cssObj.scale.set(
      0.03, 0.03, 0.03)

    this.glScene.add(cssObj)
  }

  clear () {

    $(`#${this.sceneId}`).remove()
  }
}