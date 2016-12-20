/////////////////////////////////////////////////////////////////////
// Viewing.Extension.CustomTreeExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import CustomTreePanel from './Viewing.Extension.CustomTree.Panel'
import ExtensionBase from 'Viewer.ExtensionBase'
import ViewerToolkit from 'Viewer.Toolkit'

class CustomTreeExtension extends ExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super(viewer, options)
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.CustomTree'
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async load() {

    this._viewer.search('Levels: 1/4" Head', (dbIdArray) => {

      //var rootNode = await ViewerToolkit.buildModelTree(
      //  this._viewer.model)

      var instanceTree =
        this._viewer.model.getData().instanceTree

      var rootId = instanceTree.getRootId()

      var rootNode = {
        dbId: rootId,
        name: instanceTree.getNodeName(rootId),
        children: []
      }

      dbIdArray.forEach((dbId) => {

        var node = {
          dbId: dbId,
          name: instanceTree.getNodeName(dbId)
        }

        this.buildNodeTreeRec(instanceTree, node)

        rootNode.children.push(node)
      })

      this.panel = new CustomTreePanel(
        this._viewer, null, rootNode)

      this.panel.setVisible(true)
    })

    console.log('Viewing.Extension.CustomTree loaded')

    return true
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.CustomTree unloaded')

    return true
  }

  buildNodeTreeRec(instanceTree, node) {

    instanceTree.enumNodeChildren(node.dbId,
      (childId) => {

        var childNode = null;

        node.children = node.children || [];

        childNode = {
          dbId: childId,
          name: instanceTree.getNodeName(childId)
        }

        node.children.push(childNode);

        this.buildNodeTreeRec(instanceTree, childNode);
      });
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  CustomTreeExtension.ExtensionId,
  CustomTreeExtension)