import { TimeSeries, SmoothieChart } from 'smoothie'
import ViewerToolkit from 'Viewer.Toolkit'
import './styles.css'

export default class WeatherScene {

  constructor () {

    this.clientId = '9a34a8feb31aa9d90cbc674273ae3905'

    this.forecastUrl = `https://api.forecast.io/forecast/${this.clientId}/37.8267,-122.423`

    this.sceneId = ViewerToolkit.guid()

    this.inputId = ViewerToolkit.guid()

    this.chartId = ViewerToolkit.guid()

    this.btnId = ViewerToolkit.guid()

    this.glScene = new THREE.Scene()

    var html = `
      <div id="${this.sceneId}" class="weather-scene">
        <div class="title">
        </div>
        <div class="controls">
          <button id="${this.btnId}" class="btn btn-info btn-save">
            <span class="glyphicon glyphicon-save-file btn-span-list">
            </span>
            Pick Location
          </button>
          <input id="${this.inputId}" type="text" class="input-latlong">
        </div>
        <canvas id="${this.chartId}" width="1430" height="730">
        </canvas>
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
      this.createChart()
    }, 1000)
  }

  createChart () {

    var ts = new TimeSeries()

    this.intervalId = setInterval(() => {

      //$.get(this.forecastUrl, (response) => {
      //
      //  console.log(response)
      //})

      ts.append(new Date().getTime(), Math.random() * 10000)

    }, 5000)

    var chart = new SmoothieChart()

    ts.append(new Date().getTime(), Math.random() * 10000)

    chart.addTimeSeries(ts, {
      strokeStyle: 'rgba(0, 255, 0, 1)',
      fillStyle: 'rgba(0, 255, 0, 0.2)',
      lineWidth: 3
    })

    chart.streamTo($(`#${this.chartId}`)[0], 100)
  }

  clear () {

    $(`#${this.sceneId}`).remove()
  }
}