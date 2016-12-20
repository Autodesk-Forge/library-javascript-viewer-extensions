/////////////////////////////////////////////////////////////////////
// Viewing.Extension.DynamicTextureExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import ViewerToolkit from 'ViewerToolkit'
import ExtensionBase from 'ExtensionBase'

class DynamicTextureExtension extends ExtensionBase {


  // simpleheat private variables
  var _heat, _data = [];

  // Configurable heatmap variables:
  // MAX-the maximum amplitude of data input
  // VAL-the value of a data input, in this case, it's constant
  // RESOLUTION-the size of the circles, high res -> smaller circles
  // FALLOFF-the rate a datapoint disappears
  // Z_POS-vertical displacement of plane
  var MAX = 2000, VAL = 1500, RESOLUTION = 20, FALLOFF = 30, Z_POS = 0.1;

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super (viewer, options)
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.DynamicTexture'
  }

  /////////////////////////////////////////////////////////////////
  // Load Callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

   this._viewer.setProgressiveRendering(false);

   //_viewer.prefs.set("ambientShadows", false);

    var bounds = this.getBounds(1)
    this.heat = this.createHeatMap(bounds)
    this.texture = this.createCanvasTexture('canvas')
    this.material = this.createMaterial(this.texture)

    var plane = this.clonePlane();

    this.animate();

    console.log("Heat Map Floor loaded.");
    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Load Callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    delete _viewer.impl.matman().materials.heatmap;
    _viewer.impl.scene.remove(_plane);

    console.log("Heat Map Floor unloaded.");
    return true;
  }

  // Animation loop for checking for new points and drawing them on texture
  animate() {

    requestAnimationFrame(this.animate);

    this.heat.add(this.receivedData());
    this.heat.add(this.receivedData());
    this.heat.add(this.receivedData());
    this.heat._data = this.decay(this.heat._data);
    this.heat.draw();

    this.texture.needsUpdate = true;

    // setting var 3 to true enables invalidation even without changing scene
    this._viewer.impl.invalidate(true, false, true);
  }

  getBounds(fragId) {

    var bBox = new THREE.Box3();

    this._viewer.model.getFragmentList().getWorldBounds(
      fragId, bBox)

    var width = Math.abs(bBox.max.x - bBox.min.x);
    var height = Math.abs(bBox.max.y - bBox.min.y);
    var depth = Math.abs(bBox.max.z - bBox.min.z);

    // min is used to shift for the shader, the others are roof dimensions
    return {width: width, height: height, depth: depth, min: bBox.min};
  }

  createHeatMap(bounds) {

    var canvas = document.createElement("canvas");
    canvas.id = "texture";
    canvas.width = bounds.width * RESOLUTION;
    canvas.height = bounds.height * RESOLUTION;
    this._viewer.container.appendChild(canvas);

    return simpleheat("texture").max(MAX);
  }

  receivedData() {

    return [Math.random() * $("#texture").width(),
      Math.random() * $("#texture").height(),
      Math.random() * VAL];
  }

  // decrements the amplitude of a signal by FALLOFF for decay over time
  decay(data) {

    // removes elements whose amlitude is < 1
    return data.filter(function(d) {
      d[2] -= FALLOFF;
      return d[2] > 1;
    });
  }

  createCanvasTexture(canvasId) {

    var canvas = document.getElementById(canvasId)

    var texture = new THREE.Texture(canvas)

    return texture;
  }

  createMaterial(texture) {

    var material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
      //alphaMap: THREE.ImageUtils.loadTexture("mask.png")
    });

    material.transparent = true;

    this._viewer.impl.matman().addMaterial(
      'heatmap', material, true);

    return material;
  }

  clonePlane(material, bounds) {

    // To use native three.js plane, use the following mesh constructor
    var geom = new THREE.PlaneGeometry(bounds.width, _bounds.height);
    var plane = new THREE.Mesh(geom, material);
    plane.position.set(0, 0, bounds.min.z + Z_POS);

    this._viewer.impl.addOverlay("pivot", plane);

    return plane;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  DynamicTextureExtension.ExtensionId,
  DynamicTextureExtension)
