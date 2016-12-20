///////////////////////////////////////////////////////////////////////////////
// Web Worker viewer extension
// by Philippe Leefsma, September 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.WebWorker = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _self = this;

  var _worker = null;

  _self.load = function () {

    _worker = new Worker(
      'uploads/extensions/Autodesk.ADN.Viewing.Extension.WebWorker/worker.js');

    _worker.addEventListener('message', function(e) {
      console.log(e.data);
    }, false);

    console.log('Autodesk.ADN.Viewing.Extension.WebWorker loaded');
    return true;
  };

  _self.unload = function () {

    console.log('Autodesk.ADN.Viewing.Extension.WebWorker unloaded');
    return true;
  };

  function sayHI() {
    worker.postMessage({'cmd': 'start', 'msg': 'Hi'});
  }

  function stop() {
    // worker.terminate() from this script would also stop the worker.
    worker.postMessage({'cmd': 'stop', 'msg': 'Bye'});
  }

  function unknownCmd() {
    worker.postMessage({'cmd': 'foobard', 'msg': '???'});
  }
};

Autodesk.ADN.Viewing.Extension.WebWorker.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.WebWorker.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.WebWorker;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.WebWorker',
  Autodesk.ADN.Viewing.Extension.WebWorker);

