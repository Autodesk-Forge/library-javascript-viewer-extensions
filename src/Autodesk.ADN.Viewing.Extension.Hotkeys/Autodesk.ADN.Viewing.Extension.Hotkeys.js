///////////////////////////////////////////////////////////////////////////////
// Hotkeys viewer extension
// by Philippe Leefsma, October 2015
// Original version by Daniel Du
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Hotkeys = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _self = this;

  var _hotkeysId = guid();

  var _hotkeyMng = Autodesk.Viewing.theHotkeyManager;

  ///////////////////////////////////////////////////////////////////
  // load callback
  //
  ///////////////////////////////////////////////////////////////////
  _self.load = function () {

    //register the hotkeys
    var pushResult = _hotkeyMng.pushHotkeys(

      _hotkeysId,
      [
        hotKeyFullScreen,
        hotKeyFullBrowser,
        hotKeyNextScreenMode
      ],
      {
        //When true, the onPress callback will be called until it returns true
        //or the hotkey state changes. The onRelease callback will be called
        //until it returns true or until the combination is reengaged. Stops
        //propagation through the stack. Non-blocking.
        tryUntilSuccess: true
      }
    );

    if (pushResult) {

      console.log('Autodesk.ADN.Viewing.Extension.Hotkeys loaded');
    }

    return true;
  }

  ///////////////////////////////////////////////////////////////////
  // unload callback
  //
  ///////////////////////////////////////////////////////////////////
  _self.unload = function () {

    _hotkeyMng.popHotkeys(_hotkeysId);

    console.log('Autodesk.ADN.Viewing.Extension.Hotkeys unloaded');

    return true;
  }

  ///////////////////////////////////////////////////////////////////
  // Autodesk.Viewing.ScreenMode.kFullScreen
  // Autodesk.Viewing.ScreenMode.kFullBrowser
  // Autodesk.Viewing.ScreenMode.kNormal
  //
  ///////////////////////////////////////////////////////////////////
  function setViewerScreenMode(mode) {

    var asmd = new Autodesk.Viewing.ApplicationScreenModeDelegate(viewer);

    if (!asmd.isModeSupported(mode)) {

      switch(mode) {

        case Autodesk.Viewing.ScreenMode.kFullScreen:
          alert('Fullscreen mode not supported :(');
          break;

        case Autodesk.Viewing.ScreenMode.kFullBrowser:
          alert('Fullbrowser mode not supported :(');
          break;

        case Autodesk.Viewing.ScreenMode.kNormal:
          alert('Normal mode not supported :(');
          break;
      }

      return;
    }

    asmd.doScreenModeChange(asmd.getMode(), mode);
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  var hotKeyFullScreen = {

    keycodes: [
      _hotkeyMng.KEYCODES.CONTROL,
      _hotkeyMng.KEYCODES.s
    ],
    onPress: function (hotkeys) {
      //handled
      return true;
    },
    onRelease: function (hotkeys) {

      setViewerScreenMode(
        Autodesk.Viewing.ScreenMode.kFullScreen);

      return true;
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  var hotKeyFullBrowser = {

    keycodes: [
      _hotkeyMng.KEYCODES.CONTROL,
      _hotkeyMng.KEYCODES.b
    ],
    onPress: function (hotkeys) {
      //handled
      return true;
    },
    onRelease: function (hotkeys) {

      setViewerScreenMode(
        Autodesk.Viewing.ScreenMode.kFullBrowser);

      return true;
    }
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  var hotKeyNextScreenMode = {

    keycodes: [
      _hotkeyMng.KEYCODES.CONTROL,
      _hotkeyMng.KEYCODES.n
    ],
    onPress: function (hotkeys) {
      //handled
      return true;
    },
    onRelease: function (hotkeys) {

      viewer.nextScreenMode();

      return true;
    }
  }

  ///////////////////////////////////////////////////////////////////
  // Generates random guid
  //
  ///////////////////////////////////////////////////////////////////
  function guid() {

    var d = new Date().getTime();

    var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });

    return guid;
  }
};

Autodesk.ADN.Viewing.Extension.Hotkeys.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Hotkeys.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Hotkeys;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Hotkeys',
  Autodesk.ADN.Viewing.Extension.Hotkeys);

//var KEYCODES = {
//  BACKSPACE: 8,
//  TAB: 9,
//  ENTER: 13,
//  SHIFT: 16,
//  CONTROL: 17,
//  ALT: 18,
//  ESCAPE: 27,
//  SPACE: 32,
//  PAGEUP: 33,
//  PAGEDOWN: 34,
//  END: 35,
//  HOME: 36,
//  LEFT: 37,
//  UP: 38,
//  RIGHT: 39,
//  DOWN: 40,
//  INSERT: 45,
//  DELETE: 46,
//  ZERO: 48,
//  a: 65,
//  b: 66,
//  c: 67,
//  d: 68,
//  e: 69,
//  f: 70,
//  g: 71,
//  h: 72,
//  i: 73,
//  j: 74,
//  k: 75,
//  l: 76,
//  m: 77,
//  n: 78,
//  o: 79,
//  p: 80,
//  q: 81,
//  r: 82,
//  s: 83,
//  t: 84,
//  u: 85,
//  v: 86,
//  w: 87,
//  x: 88,
//  y: 89,
//  z: 90,
//  F1: 112,
//  F2: 113,
//  F3: 114,
//  F4: 115,
//  F5: 116,
//  F6: 117,
//  F7: 118,
//  F8: 119,
//  F9: 120,
//  F10: 121,
//  F11: 122,
//  F12: 123,
//  SEMICOLON: 186,
//  EQUALS: 187,
//  COMMA: 188,
//  DASH: 189,
//  PERIOD: 190,
//  SLASH: 191,
//  LBRACKET: 219,
//  RBRACKET: 221,
//  SINGLEQUOTE: 222
//};
