/////////////////////////////////////////////////////////////////////
// Viewing.Extension.CustomPropertyExtension
// by Philippe Leefsma, September 2016
//
/////////////////////////////////////////////////////////////////////
import MetaPropertyPanel from './Viewing.Extension.MetaProperty.Panel'
import ExtensionBase from 'Viewer.ExtensionBase'
import ViewerToolkit from 'Viewer.Toolkit'

class MetaPropertyExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor (viewer, options = {}) {

    super (viewer, options)
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.MetaProperty';
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    this._panel = new MetaPropertyPanel(
      this._viewer,
      this._options)

    this._panel.on('setProperties', (data) => {

      return this.emit('setProperties', data)
    })

    this._viewer.setPropertyPanel(
      this._panel)

    console.log('Viewing.Extension.MetaProperty loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.MetaProperty unloaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  addProperties (properties) {

    //suppress "no properties" in panel
    if(properties.length) {

      $('div.noProperties', this._panel.container).remove()
    }

    properties.forEach((property) => {

      this._panel.addProperty(property)
    })

    this._panel.resizeToContent()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  updateProperties (properties) {

    properties.forEach((property) => {

      this._panel.updateProperty(property)
    })

    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  MetaPropertyExtension.ExtensionId,
  MetaPropertyExtension)
