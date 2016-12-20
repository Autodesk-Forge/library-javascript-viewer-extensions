///////////////////////////////////////////////////////////////////////////////
// Demo Workshop Viewer Extension
// by Philippe Leefsma, April 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Workshop = function (viewer, options) {

  /////////////////////////////////////////////////////////////////
  //  base class constructor
  //
  /////////////////////////////////////////////////////////////////
  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _self = this;
  
  var _panel = null;
  
  var _interval = null;
  
  /////////////////////////////////////////////////////////////////
  // load callback: invoked when viewer.loadExtension is called
  //
  /////////////////////////////////////////////////////////////////
  _self.load = function () {

    viewer.addEventListener(
      Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      onSelectionChanged);

    _panel = new Autodesk.ADN.WorkshopPanel(
      viewer.container,
      'WorkshopPanelId',
      'Workshop Panel');

    _interval = 0;

    console.log('Autodesk.ADN.Viewing.Extension.Workshop loaded');

    return true;
  };

  /////////////////////////////////////////////////////////////////
  // unload callback: invoked when viewer.unloadExtension is called
  //
  /////////////////////////////////////////////////////////////////
  _self.unload = function () {

    viewer.removeEventListener(
      Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      onSelectionChanged);

    _panel.setVisible(false);

    _panel.uninitialize();

    clearInterval(_interval);

    console.log('Autodesk.ADN.Viewing.Extension.Workshop unloaded');

    return true;
  };

  /////////////////////////////////////////////////////////////////
  // selection changed callback
  //
  /////////////////////////////////////////////////////////////////
  function onSelectionChanged(event) {

    function propertiesHandler(result) {

      if (result.properties) {

        _panel.setProperties(
          result.properties);

        _panel.setVisible(true);
      }
    }

    if(event.dbIdArray.length) {

      var dbId = event.dbIdArray[0];

      viewer.getProperties(
        dbId,
        propertiesHandler);

      viewer.fitToView(dbId);

      viewer.isolate(dbId);

      startRotation();
    }
    else {

      clearInterval(_interval);

      viewer.isolate([]);

      viewer.fitToView();

      _panel.setVisible(false);
    }
  }

  /////////////////////////////////////////////////////////////////
  // rotates camera around axis with center origin
  //
  /////////////////////////////////////////////////////////////////
  function rotateCamera(angle, axis) {

    var pos = viewer.navigation.getPosition();

    var position = new THREE.Vector3(
      pos.x, pos.y, pos.z);

    var rAxis = new THREE.Vector3(
      axis.x, axis.y, axis.z);

    var matrix = new THREE.Matrix4().makeRotationAxis(
      rAxis,
      angle);

    position.applyMatrix4(matrix);

    viewer.navigation.setPosition(position);
  };

  /////////////////////////////////////////////////////////////////
  // start rotation effect
  //
  /////////////////////////////////////////////////////////////////
  function startRotation() {

    clearInterval(_interval);

    setTimeout(function() {

      _interval = setInterval(function () {

        rotateCamera(0.05, {x:0, y:1, z:0});

      }, 100)}, 500);
  };

  /////////////////////////////////////////////////////////////////
  // creates panel and sets up inheritance
  //
  /////////////////////////////////////////////////////////////////
  Autodesk.ADN.WorkshopPanel = function(
    parentContainer,
    id,
    title,
    options)
  {
    Autodesk.Viewing.UI.PropertyPanel.call(
      this,
      parentContainer,
      id, title);
  };

  Autodesk.ADN.WorkshopPanel.prototype = Object.create(
    Autodesk.Viewing.UI.PropertyPanel.prototype);

  Autodesk.ADN.WorkshopPanel.prototype.constructor =
    Autodesk.ADN.WorkshopPanel;
};

/////////////////////////////////////////////////////////////////
// sets up inheritance for extension and register
//
/////////////////////////////////////////////////////////////////
Autodesk.ADN.Viewing.Extension.Workshop.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Workshop.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Workshop;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Workshop',
  Autodesk.ADN.Viewing.Extension.Workshop);

