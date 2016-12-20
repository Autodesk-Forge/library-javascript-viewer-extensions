/////////////////////////////////////////////////////////////////////
// Viewing.Extension.StateManager.Panel
// by Philippe Leefsma, June 2016
//
/////////////////////////////////////////////////////////////////////
import './Viewing.Extension.CustomTree.css'
import ToolPanelBase from 'ToolPanelBase'

export default class CustomTreePanel extends ToolPanelBase {

  constructor (viewer, btnElement, rootNode) {

    super (viewer.container, 'Custom Tree', {
      buttonElement: btnElement,
      shadow: true
    })

    $(this.container).addClass('custom-tree')

    var treeContainer = $(`#${this.container.id}-tree-container`)[0]

    this.treeDelegate = new CustomTreeDelegate(viewer)

    this.tree = new Autodesk.Viewing.UI.Tree(
      this.treeDelegate, rootNode, treeContainer, {
        excludeRoot: false,
        localize: true
      })
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent (id) {

    return `
      <div class="container" id="${id}-tree-container">
      </div>
    `
  }
}

class CustomTreeDelegate extends Autodesk.Viewing.UI.TreeDelegate {

  constructor (viewer) {

    super()

    this.viewer = viewer
  }

  getTreeNodeId (node) {

    return node.dbId
  }

  isTreeNodeGroup (node) {

    if (!node.children || !node.children.length) {

      return false
    }

    return true
  }

  onTreeNodeDoubleClick (tree, node, event) {

    console.log(node)

    this.viewer.select([node.dbId])
    this.viewer.isolate([node.dbId])
  }

  forEachChild (node, callback) {

    if (node.children) {

      node.children.forEach((child) => {

        //if(child === 'some condition') mode.getProperties(child.dbId, ()=>{  decide if node or not})

        callback(child)
      })
    }
  }
}