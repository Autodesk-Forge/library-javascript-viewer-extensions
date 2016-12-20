/////////////////////////////////////////////////////////////////////
// Viewing.Extension.InViewerSearchWrapperExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import ExtensionBase from 'Viewer.ExtensionBase'
import './Viewing.Extension.InViewerSearch.css'

class InViewerSearchWrapperExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super (viewer, options);
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.InViewerSearchWrapper';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this._viewer.loadExtension('Autodesk.InViewerSearch', {
          uiEnabled: true,
          clientId: "adsk.forge.default",
          sessionId: "forge",
          loadedModelTab: {
              enabled: true,
              displayName: 'This View',
              pageSize: 50
          },
          relatedItemsTab:{
              enabled: true,
              displayName: 'This Item',
              pageSize: 20
          }
      })

    console.log('Viewing.Extension.InViewerSearchWrapper loaded');
    
    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    this._viewer.unloadExtension('Autodesk.InViewerSearch')

    console.log('Viewing.Extension.InViewerSearchWrapper unloaded');

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
    InViewerSearchWrapperExtension.ExtensionId,
    InViewerSearchWrapperExtension);
