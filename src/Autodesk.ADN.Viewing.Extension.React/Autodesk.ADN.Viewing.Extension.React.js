/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.React
// by Philippe Leefsma, January 2016
//
/////////////////////////////////////////////////////////////////////

import ReactPanel from './Autodesk.ADN.Viewing.Extension.React.Panel'

class ReactExtension extends Autodesk.Viewing.Extension{

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options);

    this.viewer = viewer;

    this.panel = new ReactPanel(this.viewer);
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this.panel.setVisible(true);

    console.log("Autodesk.ADN.Viewing.Extension.React Loaded");

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this.panel.setVisible(false);

    console.log("Autodesk.ADN.Viewing.Extension.React Unloaded");

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.React',
  ReactExtension);

