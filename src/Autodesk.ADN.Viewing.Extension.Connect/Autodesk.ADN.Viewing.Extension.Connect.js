///////////////////////////////////////////////////////////////////////////////
// Connect viewer extension using postal.js
// by Philippe Leefsma, November 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Connect = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _channel = options.channel;

    var _subscription = null;

    var _thisExtension = this;

    var _guid = guid();

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    _thisExtension.load = function () {

        _subscription = _channel.subscribe(
          "extension.connect",
          onChannelMessage);

        _channel.publish(
          "extension.connect",
          {
              guid : _guid,
              mdsgId: 'extension.loaded'
          });

        console.log('Autodesk.ADN.Viewing.Extension.Connect loaded');

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    _thisExtension.unload = function () {

        _subscription.unsubscribe();

        _channel.publish(
          "extension.connect",
          {
              guid : _guid,
              mdsgId: 'extension.unloaded'
          });

        console.log('Autodesk.ADN.Viewing.Extension.Connect unloaded');

        return true;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    function onChannelMessage(data, envelope) {

        if(data.guid !== _guid) {

            console.log(data);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    function guid() {

        var d = new Date().getTime();

        var guid = 'xxxx-xxxx-xxxx'.replace(
            /[xy]/g,
            function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });

        return guid;
    };
};

Autodesk.ADN.Viewing.Extension.Connect.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Connect.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Connect;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Connect',
    Autodesk.ADN.Viewing.Extension.Connect);

