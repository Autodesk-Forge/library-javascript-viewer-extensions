///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Measure
// by Philippe Leefsma, May 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Measure = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _viewer = viewer;

  var _this = this;

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  _this.load = function () {

    // this extension is just a wrapper around the
    // native viewer extension "Autodesk.Measure"
    _viewer.loadExtension("Autodesk.Measure");

    console.log('Autodesk.ADN.Viewing.Extension.Measure loaded');

    return true;
  };

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  _this.unload = function () {

    _viewer.unloadExtension("Autodesk.Measure");

    console.log('Autodesk.ADN.Viewing.Extension.Measure unloaded');

    return true;
  };
};

Autodesk.ADN.Viewing.Extension.Measure.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Measure.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Measure;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Measure',
  Autodesk.ADN.Viewing.Extension.Measure);

