/////////////////////////////////////////////////////////////////////
// Viewing.Extension.CustomTreeExtension
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import ViewerToolkit from 'Viewer.Toolkit'

export default class CustomModelStructurePanel
    extends Autodesk.Viewing.UI.ModelStructurePanel {

    /////////////////////////////////////////////////////////////////
    // Class constructor
    //
    /////////////////////////////////////////////////////////////////
    constructor (viewer, id, title, options) {

        super(viewer.container, id, title, options)

        this.viewer = viewer

        this.instanceTree =
          viewer.model.getData().instanceTree

        var rootId = this.instanceTree.getRootId()

        var name = this.instanceTree.getNodeName(rootId)

        this.setModel(this.instanceTree, name)
    }

    shouldInclude (nodeId) {

        return true
    }
}