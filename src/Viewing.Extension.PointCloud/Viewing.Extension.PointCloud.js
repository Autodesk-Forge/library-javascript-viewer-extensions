///////////////////////////////////////////////////////////////////////////////
// PointCloud viewer extension
// by Philippe Leefsma, March 2016
//
///////////////////////////////////////////////////////////////////////////////
import ExtensionBase from 'Viewer.ExtensionBase'

class PointCloud extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super (viewer, options)
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    var particles = 100;
    var n = 200, n2 = n / 2;
    var geometry = new THREE.Geometry();

    for (var i = 0; i < particles; i++) {

      var x = Math.random() * n - n2;
      var y = Math.random() * n - n2;
      var z = Math.random() * n - n2;

      geometry.vertices.push(
        new THREE.Vector3(x, y, z)
      )

      geometry.colors.push(
          new THREE.Color(
              Math.random(),
              Math.random(),
              Math.random()));
    }

    THREE.ImageUtils.crossOrigin = '';

    var material = new THREE.PointCloudMaterial({
      //map : THREE.ImageUtils.loadTexture('text.jpg'),
      vertexColors: THREE.VertexColors,
      size : 150
      //sizeAttenuation : true,
      //transparent : true,
      //opacity : 0.6
    });

    this.pointCloud = new THREE.PointCloud(
      geometry,
      material);

    this.pointCloud.sortParticles = true;

    this._viewer.impl.scene.add(
      this.pointCloud);

    this._viewer.impl.invalidate(
      true, false, false);

    console.log('Viewing.Extension.PointCloud Loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.PointCloud Unloaded');

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Viewing.Extension.PointCloud',
  PointCloud);


