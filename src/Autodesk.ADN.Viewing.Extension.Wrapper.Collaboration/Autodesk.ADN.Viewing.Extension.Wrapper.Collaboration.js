///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Wrapper.Collaboration
// by Philippe Leefsma, May 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension.Wrapper");

Autodesk.ADN.Viewing.Extension.Wrapper.Collaboration = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);
  
  var _thisExtension = this;

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  _thisExtension.load = function () {

    // this extension is just a wrapper around the
    // native viewer extension "Autodesk.Viewing.Collaboration"
    viewer.loadExtension("Autodesk.Viewing.Collaboration");

    console.log('Autodesk.ADN.Viewing.Extension.Wrapper.Collaboration loaded');

    return true;
  };

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  _thisExtension.unload = function () {

    viewer.unloadExtension("Autodesk.Viewing.Collaboration");

    console.log('Autodesk.ADN.Viewing.Extension.Wrapper.Collaboration unloaded');

    return true;
  };
};

Autodesk.ADN.Viewing.Extension.Wrapper.Collaboration.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Wrapper.Collaboration.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Wrapper.Collaboration;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Wrapper.Collaboration',
  Autodesk.ADN.Viewing.Extension.Wrapper.Collaboration);

