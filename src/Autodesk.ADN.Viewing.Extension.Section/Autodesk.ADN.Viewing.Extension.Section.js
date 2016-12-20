///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.AnimationManager
// by Philippe Leefsma, May 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Section = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _viewer = viewer;

  var _this = this;

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  _this.load = function () {
  
    // this extension is just a wrapper around the
    // native viewer extension "Autodesk.Section"
    _viewer.loadExtension("Autodesk.Section");

    console.log('Autodesk.ADN.Viewing.Extension.Section loaded');

    return true;
  };

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  _this.unload = function () {

    _viewer.unloadExtension("Autodesk.Section");

    console.log('Autodesk.ADN.Viewing.Extension.Section unloaded');

    return true;
  };
};

Autodesk.ADN.Viewing.Extension.Section.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Section.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Section;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Section',
  Autodesk.ADN.Viewing.Extension.Section);

