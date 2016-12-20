///////////////////////////////////////////////////////////////////////////////
// ES7Async viewer extension
// by Philippe Leefsma, November 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.ES7Async = function (viewer, options) {
  
  Autodesk.Viewing.Extension.call(this, viewer, options);
  
  var _self = this;

  /////////////////////////////////////////////////////////////
  // Async wrapper for viewer.getProperties
  //
  /////////////////////////////////////////////////////////////
  viewer.getPropertiesAsync = function(dbId) {

    return new Promise(function(resolve, reject) {

      viewer.getProperties(dbId, function(result){

        if (result.properties) {

          resolve(result.properties);
        }
        else {

          reject(new Error('Error getting properties'));
        }
      });
    });
  }

  /////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////
  _self.load = function () {

    viewer.addEventListener(
      Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      onSelectionChanged);

    console.log('Autodesk.ADN.Viewing.Extension.ES7Async loaded');
    
    return true;
  }

  /////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////
  _self.unload = function () {

    viewer.removeEventListener(
      Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      onSelectionChanged);

    console.log('Autodesk.ADN.Viewing.Extension.ES7Async unloaded');
    
    return true;
  }

  /////////////////////////////////////////////////////////////
  // async method
  //
  /////////////////////////////////////////////////////////////
  async function dumpProperties(dbId) {

    try {

      let properties = await viewer.getPropertiesAsync(dbId);

      properties.map((prop) => {
        console.log(prop)
      });
    }
    catch(ex){

      console.log(ex);
    }
  }

  /////////////////////////////////////////////////////////////
  // selection changed handler
  //
  /////////////////////////////////////////////////////////////
  function onSelectionChanged(event) {

    event.dbIdArray.map((dbId) => {
      dumpProperties(dbId)
    });

    return true;
  };
};

Autodesk.ADN.Viewing.Extension.ES7Async.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.ES7Async.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.ES7Async;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.ES7Async',
  Autodesk.ADN.Viewing.Extension.ES7Async);

