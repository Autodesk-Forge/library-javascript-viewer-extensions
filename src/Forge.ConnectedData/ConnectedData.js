
import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js'
import randomColor from 'randomcolor'
import './ConnectedData.css'

class Data {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor (snap, opts) {

    this.connectorIds = []

    this.id = Data.guid()

    this.x = opts.x
    this.y = opts.y

    this.element = snap.paper.circle(
      opts.x, opts.y, 0)

    this.element.animate(
      { r: opts.r },
      3000,
      mina.elastic,
      () => {
        this.element.attr({
          stroke: '#0000FF'
        })
      })

    this.element.attr({
      fill: randomClr(),
      stroke: '#FF0000',
      strokeWidth: 2,
      opacity: 1
    })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  destroy () {

    this.element.animate(
      { r: 0 },
      3000,
      mina.easeinout,
      () => {
        this.element.remove()
      })
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  static guid (format = 'xxxxxxxxxx') {

    var d = new Date().getTime()

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
  }
}


class Connector {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor (snap, opts) {

    this.id = Data.guid()

    this.x1 = opts.x1
    this.y1 = opts.y1

    this.x2 = opts.x2
    this.y2 = opts.y2

    this.element = snap.paper.line(
      opts.x1, opts.y1,
      opts.x1, opts.y1)

    this.element.attr({
      fill: 'none',
      strokeWidth: 1,
      stroke: '#FFFFFF',
      strokeLinecap: 'round',
      strokeDasharray: "1 5 1 5"
    })

    this.length = Math.sqrt(
      (opts.x1 - opts.x2) * (opts.x1 - opts.x2) +
      (opts.y1 - opts.y2) * (opts.y1 - opts.y2))

    this.dir = {
      x: (opts.x2 - opts.x1) / this.length,
      y: (opts.y2 - opts.y1) / this.length
    }

    this.element.attr({
      x2: opts.x2,
      y2: opts.y2
    })

    Snap.animate(0, this.length, (length) => {

      this.element.attr({

        x2: opts.x1 + length * this.dir.x,
        y2: opts.y1 + length * this.dir.y
      })

    }, 1500, mina.easeinout)
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  destroy () {

    Snap.animate(0, this.length / 2, (length) => {

      this.element.attr({

        x1: this.x1 + length * this.dir.x,
        y1: this.y1 + length * this.dir.y,

        x2: this.x2 - length * this.dir.x,
        y2: this.y2 - length * this.dir.y
      })

    }, 1000, mina.easeinout, () => {

      this.element.remove()
    })
  }
}

export default class ConnectedDataManager {

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  constructor (container) {

    this.svgDataId = 'connected-data'
    this.svgConnectorId = 'connected-connector'

    $(container).append(`
      <svg id="${this.svgDataId}"
        class="connected-data">
      </svg>
      <svg id="${this.svgConnectorId}"
        class="connected-connector">
      </svg>
      `)

    this.snapData = Snap($(`#${this.svgDataId}`)[0])
    this.snapConnector = Snap($(`#${this.svgConnectorId}`)[0])

    this.dataCollector = {}

    this.connectors = {}

    this.step()
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  step () {

    var settings = {
      minR: 4,
      maxR: 16,
      minX: 10,
      minY: 20,
      maxX: 790,
      maxY: 495,
      minLife: 20000,
      maxLife: 40000
    }

    var data = new Data(this.snapData, {

      x: getRandom(
        settings.minX + settings.maxR,
        settings.maxX - settings.maxR),

      y: getRandom(
        settings.minY + settings.maxR,
        settings.maxY - settings.maxR),

      r: getRandom(
        settings.minR, settings.maxR)
    })

    var keys = Object.keys(this.dataCollector)

    var nbConnectors = getRandom(0, 3)

    for (var i = 0; i < Math.min(keys.length, nbConnectors); i++) {

      var idx = getRandom(0, keys.length - 1)

      var dataEnd = this.dataCollector[keys[idx]]

      var connector = new Connector(this.snapConnector, {
        x1: data.x,
        y1: data.y,
        x2: dataEnd.x,
        y2: dataEnd.y
      })

      this.connectors[connector.id] = connector

      dataEnd.connectorIds.push(connector.id)
      data.connectorIds.push(connector.id)
    }

    var lifeTime = getRandom(
      settings.minLife,
      settings.maxLife)

    setTimeout(() => {

      data.connectorIds.forEach((connectorId) => {

        if (this.connectors[connectorId]) {

          this.connectors[connectorId].destroy()

          delete this.connectors[connectorId]
        }
      })

      delete this.dataCollector[data.id]

      data.destroy()

    }, lifeTime)

    this.dataCollector[data.id] = data

    setTimeout(() => {
      this.step()
    }, getRandom(800, 2000))
  }
}

function getRandom (min, max) {

  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomClr () {

  var hue = ['red', 'orange', 'yellow', 'green', 'blue']

  return randomColor({
    luminosity: 'dark',
    hue: hue[getRandom(0, 4)]
  })
}
