///////////////////////////////////////////////////////////////////////////////
// PropertyPanel viewer Extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

/**
 * SampleModelStructurePanel is a simple model structure panel that on click, selects
 * the node, and on control-modifier + hover, isolates the node.
 */

Autodesk.ADN.Viewing.Extension.ModelStructurePanel = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    var _panel = null;

    var _initialModelStructurePanel = null;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel =
            function (viewer, title, options) {

                _self = this;

                Autodesk.Viewing.UI.ModelStructurePanel.call(
                    _self,
                    viewer.container,
                    'AdnModelStructurePanel',
                    title,
                    options);
            };

        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype =
            Object.create(Autodesk.Viewing.UI.ModelStructurePanel.prototype);

        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.constructor =
            Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel;

        /**
         * Override initialize to listen for the selection
         * changed event to update this panel automatically
         */
        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.
            initialize = function () {

                Autodesk.Viewing.UI.ModelStructurePanel.prototype.initialize.call(_self);

                viewer.addEventListener(
                    Autodesk.Viewing.SELECTION_CHANGED_EVENT,
                    function (event) {
                        _self.setSelection(event.nodeArray);
                    });
            }

        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.
            ctrlDown = function (event) {

                return (_self.isMac && event.metaKey) ||
                    (!_self.isMac && event.ctrlKey);
            }

        /**
         * Override onClick to select the given node
         */
        Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.
            onClick = function (nodeId, event) {

                viewer.isolate();

                viewer.select(nodeId);
            }

        _panel = new Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel(
            viewer);

        viewer.setModelStructurePanel(_panel);

        console.log("Autodesk.ADN.Viewing.Extension.ModelStructurePanel loaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        //TODO: cannot unload properly ...
        //viewer.showModelStructurePanel(false);
        //
        //var options = {
        //    docStructureConfig: viewer.config.docStructureConfig
        //};
        //
        //var panel = new Autodesk.Viewing.UI.ModelStructurePanel(
        //  viewer, 'Browser', options);
        //
        //viewer.setModelStructurePanel(panel);

        console.log("Autodesk.ADN.Viewing.Extension.ModelStructurePanel unloaded");

        return true;
    };
};

Autodesk.ADN.Viewing.Extension.ModelStructurePanel.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.ModelStructurePanel.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.ModelStructurePanel;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.ModelStructurePanel',
    Autodesk.ADN.Viewing.Extension.ModelStructurePanel);