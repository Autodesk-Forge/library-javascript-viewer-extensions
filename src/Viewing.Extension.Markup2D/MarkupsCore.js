(function(){ 'use strict';

    var namespace = AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core.Utils');

    /**
     *
     * @param markupType
     * @returns {*}
     */
    namespace.getTypeString = function(markupType) {

        var core = Autodesk.Viewing.Extensions.Markups.Core;
        switch (markupType) {
            case core.MARKUP_TYPE_TEXT:
                return core.MARKUP_EXPORT_TYPE_LABEL;
            case core.MARKUP_TYPE_ARROW:
                return core.MARKUP_EXPORT_TYPE_ARROW;
            case core.MARKUP_TYPE_RECTANGLE:
                return core.MARKUP_EXPORT_TYPE_RECTANGLE;
            case core.MARKUP_TYPE_CIRCLE:
                return core.MARKUP_EXPORT_TYPE_CIRCLE;
            case core.MARKUP_TYPE_CLOUD:
                return core.MARKUP_EXPORT_TYPE_CLOUD;
            case core.MARKUP_TYPE_FREEHAND:
                return core.MARKUP_EXPORT_TYPE_FREEHAND;
        }
        return 'Unknown(' + id + ')';
    };

    /**
     * // isTouchDevice is an LMV function. Hammer is included by LMV as well
     * @returns {boolean}
     */
    namespace.isTouchDevice = function() {
        // isTouchDevice() is an LMV function.
        // Hammer (a touch detection lib) is packaged with LMV as well
        if (typeof isTouchDevice === "function" && typeof Hammer === "function") {
            return isTouchDevice();
        }
        return false;
    };

    //// SVG  //////////////////////////////////////////////////////////////////////////////////////////////////////////

    namespace.createSvgElement = function(type) {

        // See https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS
        var namespace = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(namespace, type);
        svg.setAttribute('pointer-events', 'inherit');

        return svg;
    };

    /**
     *
     * @param {Element} svg - an SVGElement
     * @returns {Element} svg param is returned back
     */
    namespace.setSvgParentAttributes = function(svg) {

        // See: https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course
        svg.setAttribute('version', '1.1'); // Notice that this is the SVG version, not the "MARKUP DATA VERSION"!
        svg.setAttribute('baseProfile', 'full');
        return svg;
    };

    /**
     * Helper function that injects metadata for the whole Markup document.
     * Metadata includes: version.
     * @param {Element} svg - an SVGElement
     * @param {Object} metadata - Dictionary with attributes
     */
    namespace.addSvgMetadata = function(svg ,metadata) {

        var metadataNode = document.createElementNS('http://www.w3.org/2000/svg', 'metadata');
        var dataVersionNode = document.createElement('markup_document');

        metadataNode.appendChild(dataVersionNode);

        // NOTE: We could iterate over the properties, but we don't because these are the only ones supported
        dataVersionNode.setAttribute("data-model-version", metadata["data-model-version"]); // Version. For example: "1"

        svg.insertBefore(metadataNode, svg.firstChild);
        return metadataNode;
    };

    /**
     * Helper function that injects metadata for specific markup svg nodes.
     * @param {Element} markupNode - an SVGElement for the markup
     * @param {Object} metadata - Dictionary where all key/value pairs are added as metadata entries.
     * @returns {Element}
     */
    namespace.addMarkupMetadata = function(markupNode, metadata) {

        var metadataNode = document.createElementNS('http://www.w3.org/2000/svg', 'metadata');
        var dataVersionNode = document.createElement('markup_element');

        metadataNode.appendChild(dataVersionNode);
        for (var key in metadata) {
            if (metadata.hasOwnProperty(key)) {
                dataVersionNode.setAttribute(key, metadata[key]);
            }
        }

        markupNode.insertBefore(metadataNode, markupNode.firstChild);
        return metadataNode;
    };

    /**
     * Removes al metadata nodes from an Svg node structure.
     * Method will remove all metadata nodes from children nodes as well.
     * @param svgNode
     */
    namespace.removeAllMetadata = function(svgNode) {

        var nodes = svgNode.getElementsByTagName("metadata");
        for (var i=0; i<nodes.length; ++i) {
            var metadataNode = nodes[i];
            metadataNode.parentNode && metadataNode.parentNode.removeChild(metadataNode);
        }

        // Transverse children nodes
        var svgChildren = svgNode.children || svgNode.childNodes;
        for (i=0; i<svgChildren.length; ++i) {
            this.removeAllMetadata(svgChildren[i]);
        }
    };

    /**
     * Utility function that transfers children from an Html/Svg node into another one.
     * @param nodeFrom - The node instance from where children will be taken.
     * @param nodeInto - The node that's going to parent the transferred children.
     */
    namespace.transferChildNodes = function(nodeFrom, nodeInto) {
        var svgChildren = nodeFrom.children || nodeFrom.childNodes;
        var tmpArray = [];
        for (var i=0; i<svgChildren.length; ++i){
            tmpArray.push(svgChildren[i]); // Avoid appendChild
        }
        tmpArray.forEach(function(node){
            nodeInto.appendChild(node);
        });
    };

    /**
     * Serializes an SVG node into a String.
     * @param domNode
     * @returns {string}
     */
    namespace.svgNodeToString = function(domNode){

        var result;
        try {
            var xmlSerializer = new XMLSerializer();
            result = xmlSerializer.serializeToString(domNode);
        } catch (err) {
            result = '';
            console.warn('svgNodeToString failed to generate string representation of domNode.');
        }
        return result;
    };

    namespace.stringToSvgNode = function(stringNode){

        var node = null;
        try {
            var domParser = new DOMParser();
            var doc = domParser.parseFromString(stringNode, "text/xml");
            node = doc.firstChild; // We should only be getting 1 child anyway.
        } catch (err) {
            node = null;
            console.warn('stringToSvgNode failed to generate an HTMLElement from its string representation.');
        }
        return node;
    };

    /**
     * Injects functions and members to a client object which will
     * receive the ability to dispatch events.
     * Mechanism is the same as in Autodesk.Viewing.Viewer.
     *
     * Note: All of the code here comes from Autodesk.Viewing.Viewer
     *
     * @param {Object} client - Object that will become an event dispatcher.
     */
    namespace.addTraitEventDispatcher = function(client) {

        // Inject member variable
        client.listeners = {};

        // Inject functions
        client.addEventListener = function(type, listener) {
            if (typeof this.listeners[type] == "undefined"){
                this.listeners[type] = [];
            }
            this.listeners[type].push(listener);
        };
        client.hasEventListener = function (type, listener) {
            if (this.listeners === undefined) return false;
            var listeners = this.listeners;
            if (listeners[ type ] !== undefined && listeners[ type ].indexOf(listener) !== -1) {
                return true;
            }
            return false;
        };
        client.removeEventListener = function(type, listener) {
            if (this.listeners[type] instanceof Array){
                var li = this.listeners[type];
                for (var i=0, len=li.length; i < len; i++){
                    if (li[i] === listener){
                        li.splice(i, 1);
                        break;
                    }
                }
            }
        };
        client.fireEvent = function(event) {
            if (typeof event == "string"){
                event = { type: event };
            }
            if (!event.target){
                event.target = this;
            }

            if (!event.type){
                throw new Error("event type unknown.");
            }

            if (this.listeners[event.type] instanceof Array) {
                var typeListeners = this.listeners[event.type].slice();
                for (var i=0; i < typeListeners.length; i++) {
                    typeListeners[i].call(this, event);
                }
            }
        };
    };

    /**
     * Removes the EventDispatcher trait
     *
     * @param {Object} client
     */
    namespace.removeTraitEventDispatcher = function(client) {

        try {
            delete client.listeners;
            delete client.addEventListener;
            delete client.hasEventListener;
            delete client.removeEventListener;
            delete client.fireEvent;
        } catch (e) {
            // nothing
        }
    };

    //// Math  /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Calculates the pixel position in client space coordinates of a point in world space.
     * @param {THREE.Vector3} point Point in world space coordinates.
     * @param viewer
     * @param snap Round values to closest pixel center.
     * @returns {THREE.Vector3} Point transformed and projected into client space coordinates.
     */
    namespace.worldToClient = function(point, viewer, snap) {

        var p = namespace.worldToViewport(point, viewer);
        var result = viewer.impl.viewportToClient(p.x, p.y);
        result.z = 0;

        // snap to the center of the
        if (snap) {
            result.x = Math.floor(result.x) + 0.5;
            result.y = Math.floor(result.y) + 0.5;
        }

        return result;
    };

    namespace.clientToWorld = function(clientX, clientY, depth, viewer) {

        var point = viewer.impl.clientToViewport(clientX, clientY);
        point.z = depth;

        point.unproject(viewer.impl.camera);
        return point;
    };

    /**
     * Calculates the world position of a point in client space coordinates.
     * @param {Object} point - { x:Number, y:Number, z:Number }
     * @param {Object} viewer - LMV instance
     * @returns {THREE.Vector3}
     */
    namespace.worldToViewport = function(point, viewer) {

        var p = new THREE.Vector3();

        p.x = point.x;
        p.y = point.y;
        p.z = point.z;

        p.project(viewer.impl.camera);
        return p;
    };

    namespace.metersToModel = function(meters, viewer) {

        var modelToMeter = viewer.model.getUnitScale();
        var meterToModel = 1 / modelToMeter;

        return meterToModel * meters;
    };

    namespace.radiansToDegrees = function (radians) {

        return radians * (180 / Math.PI);
    };

    namespace.degreesToRadians = function(degrees) {

        return degrees * (Math.PI / 180);
    };

    /**
     *
     * @param value
     * @returns {number}
     */
    namespace.sign = function (value) {

        return (value >= 0) ? 1 : -1;
    };

    //// LMV Viewer ////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Makes sure LMV's camera is set to Orthographic.
     * Only works with 3d models; will do nothing when a 2d model is loaded.
     * @param {Object} viewer - LMV instance
     */
    namespace.forceOrthographicCamera = function(viewer) {

        if(!viewer || !viewer.navigation || viewer.model.is2d())
            return;

        var navApi = viewer.navigation;
        var camera = navApi.getCamera();

        if (camera.isPerspective) {
            navApi.toOrthographic();
        }
    };

    //// LMV ui ////////////////////////////////////////////////////////////////////////////////////////////////////////

    namespace.hideLmvUi = function(viewer) {

        // Exit other tools and hide HudMessages.
        viewer.setActiveNavigationTool();

        namespace.dismissLmvHudMessage();
        namespace.hideLmvPanels(true, viewer);
        namespace.hideLmvToolsAndPanels(viewer);
    };

    namespace.restoreLmvUi = function(viewer) {

        namespace.dismissLmvHudMessage();
        namespace.hideLmvPanels(false, viewer);
        namespace.showLmvToolsAndPanels(viewer);
    };

    /**
     *
     * @param hide
     * @param viewer
     */
    namespace.hideLmvPanels = function(hide, viewer) {

        var dockingPanels = viewer.dockingPanels;

        // Panels may not be present when dealing with an instance of Viewer3D.js
        // (as opposed to an instance of GuiViewer3D.js)
        if (!dockingPanels) return;

        for (var i = 0; i < dockingPanels.length; ++i) {

            var panel = dockingPanels[i];
            var panelContainer = panel.container;

            if (panelContainer.classList.contains("dockingPanelVisible")) {
                panelContainer.style.display = hide ? "none" : "block";

                // Call the visibility changed notification if any additional
                // stuff needs to be done (update the date i.e. PropertyPanel, etc).
                panel.visibilityChanged();
            }
        }
    };

    /**
     * Shows panels and tools in the viewer.
     * @param viewer
     */
    namespace.showLmvToolsAndPanels = function(viewer) {

        // Restore view cube.
        if(!viewer.model.is2d()) {
            viewer.displayViewCube(true, false);
        }

        // TODO: Find or ask for a better way to restore this buttons.
        // Hide home and info button.
        var home = document.getElementsByClassName('homeViewWrapper');
        var info = document.getElementsByClassName('infoButton');
        var anim = document.getElementsByClassName('toolbar-animationSubtoolbar');

        if (home.length > 0) {
            home[0].style.display = '';
        }

        if (info.length > 0) {
            info[0].style.display = '';
        }

        if (anim.length > 0) {
            anim[0].style.display = '';
        }

        // toolbar is absent when dealing with an instance of Viewer3D (instead of GuiViewer3D)
        if (viewer.toolbar) {
            var viewerContainer = viewer.toolbar.container;
            var viewerContainerChildrenCount = viewerContainer.children.length;
            for(var i = 0; i < viewerContainerChildrenCount; ++i) {
                viewerContainer.children[i].style.display = "";
            }
        }
    };

    /**
     * Hides panels and tools in the viewer.
     * @param viewer
     */
    namespace.hideLmvToolsAndPanels = function(viewer) {

        // Hide Panels and tools.
        if (viewer && viewer.model && !viewer.model.is2d()) {
            viewer.displayViewCube(false, false);
        }

        // TODO: Find or ask for a better way to hide this buttons.
        // Hide home and info button.
        var home = document.getElementsByClassName('homeViewWrapper');
        var info = document.getElementsByClassName('infoButton');
        var anim = document.getElementsByClassName('toolbar-animationSubtoolbar');

        if (home.length > 0) {
            home[0].style.display = 'none';
        }

        if (info.length > 0) {
            info[0].style.display = 'none';
        }

        if (anim.length > 0) {
            anim[0].style.display = 'none';

            var animator = viewer.impl.keyFrameAnimator;
            if (animator && !animator.isPaused) {
                animator.pauseCameraAnimations();
                animator.pause();

                var playButton = viewer.modelTools.getControl('toolbar-animationPlay');
                if (playButton) {
                    playButton.setIcon('toolbar-animationPauseIcon');
                    playButton.setToolTip('Pause');
                }
            }
        }

        // toolbar is absent when dealing with an instance of Viewer3D (instead of GuiViewer3D)
        if (viewer.toolbar) {
            var viewerContainer = viewer.toolbar.container;
            var viewerContainerChildrenCount = viewerContainer.children.length;
            for(var i = 0; i < viewerContainerChildrenCount; ++i) {
                viewerContainer.children[i].style.display = "none";
            }
        }
    };

    /**
     * Dismisses all LMV HudMessages
     */
    namespace.dismissLmvHudMessage = function() {

        // Using try/catch block since we are accessing the Private namespace of LMV.
        try {
            var keepDismissing = true;
            while (keepDismissing) {
                keepDismissing = Autodesk.Viewing.Private.HudMessage.dismiss();
            }
        } catch (ignore) {
            // Failing to show the message is an okay fallback scenario
            console.warn("[CO2]Failed to dismiss LMV HudMessage");
        }
    };

    //// Styles ////////////////////////////////////////////////////////////////////////////////////////////////////////

    namespace.createStyle = function(attributes, viewer) {

        var style = {};

        for(var i = 0; i < attributes.length; ++i) {

            style[attributes[i]] = null;
        }

        var defaults = namespace.getStyleDefaultValues(style, viewer);

        for(var i = 0; i < attributes.length; ++i) {

            var attribute = attributes[i];
            style[attribute] = defaults[attribute].values[defaults[attribute].default].value;
        }

        return style;
    };

    /**
     *
     * @param source
     * @param destination
     */
    namespace.copyStyle = function(source, destination) {

        for(var attribute in destination) {
            if (source.hasOwnProperty(attribute)) {
                destination[attribute] = source[attribute];
            }
        }
    };

    /**
     *
     * @param source
     * @returns {{}}
     */
    namespace.cloneStyle = function(source) {

        var clone = {};

        for(var attribute in source) {
            clone[attribute] = source[attribute];
        }

        return clone;
    };

    /**
     *
     * @param style
     * @param viewer
     * @returns {{}}
     */
    namespace.getStyleDefaultValues = function(style, viewer) {

         function getStrokeWidth(viewer) {

            var width = 0;
            var data = viewer.model.getData();

            if (data.is2d) {
                width = namespace.metersToModel(0.0254, viewer) * 2; // 0.0254 m == 1 inch
            } else {

                var a = viewer.impl.viewportToClient(0.00, 0.00);
                var b = viewer.impl.viewportToClient(0.01, 0.01);

                a = namespace.clientToWorld(a.x, a.y, 0, viewer);
                b = namespace.clientToWorld(b.x, b.y, 0, viewer);

                width = Math.abs(b.y - a.y);
            }
            return width;
        }

        function getWidths(smallWidth) {

            return {
                values: [
                    {name:'Thin', value: smallWidth},
                    {name:'Normal', value: smallWidth *  3},
                    {name:'Thick', value: smallWidth *  9}],
                default: 1
            };
        }

        function getFontSizes(smallWidth) {

            return {
                values: [
                    {name:'Thin', value: smallWidth *  5},
                    {name:'Normal', value: smallWidth *  10},
                    {name:'Thick', value: smallWidth *  20}],
                default: 1
            };
        }

        function getColors() {

            return {
                values: [
                    {name:'red', value: '#ff0000'},
                    {name:'green', value: '#00ff00'},
                    {name:'blue', value: '#0000ff'},
                    {name:'white', value: '#ffffff'},
                    {name:'black', value: '#000000'}],
                default: 0
            };
        }

        function getOpacities(defaultTransparent) {

            return {
                values: [
                    {name:'100%', value: 1.00},
                    {name:'75%', value:  0.75},
                    {name:'50%', value: 0.50},
                    {name:'25%', value: 0.25},
                    {name:'0%', value: 0.00}],
                default: (defaultTransparent ? 4 : 0)
            };
        }

        function getFontFamilies() {

            // TODO: Localize?
            // TODO: Validate fonts with design
            // Source: http://www.webdesigndev.com/web-development/16-gorgeous-web-safe-fonts-to-use-with-css
            return {
                values:[
                    {name:'Arial', value: 'Arial'},
                    {name:'Arial Black', value: 'Arial Black'},
                    {name:'Arial Narrow', value: 'Arial Narrow'},
                    {name:'Century Gothic', value: 'Century Gothic'},
                    {name:'Courier New', value: 'Courier New'},
                    {name:'Georgia', value: 'Georgia'},
                    {name:'Impact', value: 'Impact'},
                    {name:'Lucida Console', value: 'Lucida Console'},
                    {name:'Tahoma', value: 'Tahoma'},
                    {name:'Verdana', value: 'Verdana'}
                ],
                default: 0
            };
        }

        function getFontStyles() {
            return {
                values:[
                    {name:'Normal', value: false},
                    {name:'Italic', value: true}],
                default: 0
            };
        }

        function getFontWeights() {
            return {
                values:[
                    {name:'Normal', value: false},
                    {name:'Bold', value: true}],
                default: 0};
        }

        var values = namespace.cloneStyle(style);
        var smallWidth = getStrokeWidth(viewer);

        for(var attribute in values) {

            switch(attribute) {
                case 'stroke-width':
                    values[attribute] = getWidths(smallWidth);
                    break;

                case 'font-size':
                    values[attribute] = getFontSizes(smallWidth);
                    break;

                case 'font-family':
                    values[attribute] = getFontFamilies();
                    break;

                case 'font-style':
                    values[attribute] = getFontStyles();
                    break;

                case 'font-weight':
                    values[attribute] = getFontWeights();
                    break;

                case 'stroke-color':
                case 'fill-color':
                    values[attribute] = getColors();
                    break;
                
                case 'stroke-opacity':
                    var defaultTransparent = false;
                    values[attribute] = getOpacities(defaultTransparent);
                    break;

                case 'fill-opacity':
                    var defaultTransparent = true;
                    values[attribute] = getOpacities(defaultTransparent);
                    break;

                default:
                    break;
            }
        }

        return values;
    };

    namespace.composeRGBAString = function(hexRGBString, opacity) {

        if (opacity <= 0) {
            return 'none';
        }

        var rgba = ['rgba(' +
            parseInt('0x' + hexRGBString.substr(1,2)), ',',
            parseInt('0x' + hexRGBString.substr(3,2)), ',',
            parseInt('0x' + hexRGBString.substr(5,2)), ',', opacity, ')'].join('');

        return rgba;
    }

})();

(function(){ 'use strict';

    AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core');

    /**
     * @class
     * Base class for all EditActions.<br>
     * EditActions encapsulate {@link Autodesk.Viewing.Extensions.Markups.Core.Markup  Markup}
     * operations (such as creation, edition and deletion) that hook into the undo/redo system.
     *
     * The minimum set of methods to implement on an EditAction extension are:
     * - execute()
     * - undo()
     * - redo()
     *
     * A good set of classes to check their implementation are:
     * - [CreateCircle]{@link Autodesk.Viewing.Extensions.Markups.Core.CreateCircle}.
     * - [DeleteCircle]{@link Autodesk.Viewing.Extensions.Markups.Core.DeleteCircle}.
     * - [SetCircle]{@link Autodesk.Viewing.Extensions.Markups.Core.SetCircle}.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     *
     * @param {Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore} editor
     * @param {String} type - An identifier for the EditAction.
     * @param {number} targetId - The id of the markup being affected.
     */
    function EditAction(editor, type, targetId) {

        this.type =  type;
        this.editor = editor;
        this.targetId = targetId;
        this.addToHistory = true;
        this.selectOnExecution = true;
    }

    Autodesk.Viewing.Extensions.Markups.Core.EditAction = EditAction;

    /**
     * Performs the action.
     */
    Autodesk.Viewing.Extensions.Markups.Core.EditAction.prototype.execute = function() {

        this.editor.actionManager.execute(this);
    };

    /**
     * @abstract
     */
    Autodesk.Viewing.Extensions.Markups.Core.EditAction.prototype.redo = function() {

    };

    /**
     * @abstract
     */
    Autodesk.Viewing.Extensions.Markups.Core.EditAction.prototype.undo = function() {

    };

    /**
     * Provides a mechanism to merge consecutive actions of the same type.
     * @param {Autodesk.Viewing.Extensions.Markups.Core.EditAction} action - Action to check if it can be merged with 'this'.
     * @returns {boolean} Returns true if merge has been applied. Parameter will be discarded.
     */
    Autodesk.Viewing.Extensions.Markups.Core.EditAction.prototype.merge = function(action) {

        return false;
    };

    /**
     * Provides a mechanism to check whether the action yields no results.
     * @returns {boolean} Returns true if no changes happen with this action.
     */
    Autodesk.Viewing.Extensions.Markups.Core.EditAction.prototype.isIdentity = function() {

        return false;
    };

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param historySize
     * @constructor
     */
    function EditActionManager(historySize) {

        this.historySize = historySize;

        this.undoStack = new Array(historySize);
        this.redoStack = new Array(historySize);

        namespaceUtils.addTraitEventDispatcher(this);
    }

    /*
     * Event types
     */
    namespace.EVENT_HISTORY_CHANGED = "EVENT_HISTORY_CHANGED";

    var proto = EditActionManager.prototype;

    /**
     *
     * @param action
     */
    proto.execute = function(action) {

        var redoStack = this.redoStack;
        var undoStack = this.undoStack;

        redoStack.splice(0, redoStack.length);

        action.redo();

        var group = this.getEditActionGroup();
        if (group.isOpen()) {
            group.addAction(action);
        } else {
            group.open();
            group.addAction(action);
            group.close();
        }

        if (undoStack.length > this.historySize) {
            undoStack.splice(0,1);
        }

        var targetId = action.selectOnExecution ? action.targetId : -1;
        this.fireEvent(
            {type: namespace.EVENT_HISTORY_CHANGED, data: {action: 'execute', targetId: targetId}});
    };

    proto.beginActionGroup = function() {

        var undoStack = this.undoStack;
        var undoStackCount = undoStack.length;
        var group = null;

        if (undoStackCount === 0 || undoStack[undoStackCount-1].isClosed()) {

            group = this.getEditActionGroup();
            group.open();
        } else {
            console.warn('Markups - Undo/Redo - Action edit group already open.');
        }
    };

    proto.closeActionGroup = function() {

        var undoStack = this.undoStack;
        var undoStackCount = undoStack.length;

        if (undoStackCount === 0) {

            console.warn('Markups - Undo/Redo - There is no action edit group to close.');
            return;
        }

        var group = undoStack[undoStackCount-1];
        if(!group.close()) {
            console.warn('Markups - Undo/Redo - Action edit group already closed.');
        }

        if (group.isEmpty()) {
            undoStack.pop();
        }
    };

    proto.cancelActionGroup = function() {

        var undoStack = this.undoStack;
        var undoStackCount = undoStack.length;

        if (undoStackCount === 0) {

            console.warn('Markups - Undo/Redo - There is no action edit group to close.');
            return;
        }

        var group = undoStack[undoStackCount-1];
        if(!group.close()) {
            console.warn('Markups - Undo/Redo - Action edit group already closed.');
            return;
        }

        group.undo();
        undoStack.pop();

        this.fireEvent(
            {type: namespace.EVENT_HISTORY_CHANGED, data: {action: 'cancel', targetId: -1}});
    };

    proto.undo = function() {

        var undoStack = this.undoStack;
        var redoStack = this.redoStack;

        if (undoStack.length === 0) {
            return;
        }

        var group = undoStack.pop();
        var targetId = group.undo();

        redoStack.push(group);

        this.fireEvent(
            {type: namespace.EVENT_HISTORY_CHANGED, data: {action:'undo', targetId: targetId}});
    };

    proto.redo = function() {

        var undoStack = this.undoStack;
        var redoStack = this.redoStack;

        if (redoStack.length === 0) {
            return;
        }

        var group = redoStack.pop();
        var targetId = group.redo();

        undoStack.push(group);

        this.fireEvent(
            {type: namespace.EVENT_HISTORY_CHANGED, data: {action:'redo', targetId: targetId}});
    };

    proto.clear = function() {

        this.undoStack.splice(0, this.undoStack.length);
        this.redoStack.splice(0, this.redoStack.length);

        this.fireEvent(
            {type: namespace.EVENT_HISTORY_CHANGED, data: {action:'clear', targetId: -1}});
    };

    proto.isUndoStackEmpty = function() {

        return this.undoStack.length === 0;
    };

    proto.isRedoStackEmpty = function() {

        return this.redoStack.length === 0;
    };

    /**
     *
     * @return action
     * @private
     */
    proto.getEditActionGroup = function() {

        var undoStack = this.undoStack;
        var undoStackCount = this.undoStack.length;

        var group = null;

        if (undoStackCount === 0 || undoStack[undoStackCount-1].isClosed()) {
            group = new namespace.EditActionGroup();
            undoStack.push(group);
        } else {
            group = undoStack[undoStackCount-1];
        }

        return group;
    };

    namespace.EditActionManager = EditActionManager;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * Curring object which generate a string that can be used
     * as a Dom element's 'style' value.
     *
     * @constructor
     */
    function DomElementStyle() {

        this.reset();
    }

    /*
     * Constants
     */
    var BROWSER_PREFIXES = ['-ms-', '-webkit-', '-moz-', '-o-'];

    var proto = DomElementStyle.prototype;

    proto.reset = function() {

        this.attributes = {};
        this.dirty = false;
        this.styleString = '';

        return this;
    };

    /**
     *
     * @param {String} key
     * @param {*} value
     * @param {Object} [options]
     * @param {Boolean} [options.allBrowsers] - Whether to add browser prefix to key
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.Utils.DomeElemStyle}
     */
    proto.setAttribute = function(key, value, options) {

        this.attributes[key] = value;

        if (options && options.allBrowsers) {
            var that = this;
            BROWSER_PREFIXES.forEach(function(prefix){
                that.attributes[(prefix+key)] = value;
            });
        }
        this.dirty = true; // Could be optimized
        return this;
    };

    /**
     * Removes one or more attributes
     * @param {String|Array} key - Key or Keys to be removed
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.Utils.DomElemStyle} this
     */
    proto.removeAttribute = function(key) {

        if (!Array.isArray(key)) {
            key = [key];
        }

        var self = this;
        key.forEach(function(k) {
            if (k in self.attributes) {
                delete self.attributes[k];
                self.dirty = true;
            }
        });
        return this;
    };

    /**
     * Gets the String representation of this style object
     * @returns {string}
     */
    proto.getStyleString = function() {

        if (this.dirty) {
            this.styleString = generateStyle(this.attributes);
            this.dirty = false;
        }
        return this.styleString;
    };

    /**
     * Clones the current Object
     *
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.Utils.DomElemStyle}
     */
    proto.clone = function() {

        var clone = new namespace.DomElementStyle();
        var attributes = this.attributes;

        for (var key in attributes) {
            clone.setAttribute(key, attributes[key]);
        }
        return clone;
    };

    /**
     * Generates the style value string. Non mutable function.
     *
     * @param {Object} attributes
     * @private
     */
    function generateStyle(attributes) {

        var elements = [];
        for (var key in attributes) {
            var val = attributes[key];
            elements.push(key);
            elements.push(':');
            elements.push(val);
            elements.push('; ');
        }
        return elements.join('');
    }

    namespace.DomElementStyle = DomElementStyle;

})();

 (function () { 'use strict';

     var namespace = Autodesk.Viewing.Extensions.Markups.Core;
     var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * A component to handle the selection of markups.
     *
     *
     *      Sample
     *
     *      var containingDiv = document.getElementById('containingDiv3d-app-wrapper');
     *      var selectionComponent = new EditFrame(containingDiv);
     *      selectionComponent.setSelection(100, 100, 300, 150, 0);
     *
     * @param {HTMLElement} containingDiv The container where the selection layer will live.
     * @param {Object} editor
     * @constructor
     */
    function EditFrame(containingDiv, editor) {

        this.containingDiv = containingDiv;
        this.editor = editor;
        this.selectionLayer = createSelectionLayer();

        this.selection = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            rotation: 0,
            element: null,
            active: false,
            dragging: false,
            resizing: false,
            //a dictionary of all the drag points
            //the key for each drag point will be its cardinal/ordinal direction
            handle: {}
        };

        createSelectorBox.bind(this)();

        if (namespaceUtils.isTouchDevice()) {
            this.onHammerDragBinded = this.onHammerDrag.bind(this);
            this.hammer = new Hammer.Manager(this.selectionLayer, {
                recognizers: [
                    [Hammer.Pan, { event: 'drag', pointers: 1 } ]
                ],
                inputClass: Hammer.TouchInput
            });
        }
        handleSelectionBoxDragging.bind(this)();
        handleSelectionBoxResizing.bind(this)();
        handleSelectionDoubleClick.bind(this)();
        handleSelectionBoxRotating.bind(this)();

        //add the selection into the container given to us
        this.containingDiv.appendChild(this.selectionLayer);

        namespaceUtils.addTraitEventDispatcher(this);
    }

    // Constants //
    namespace.EVENT_EDITFRAME_EDITION_START = "EVENT_EDITFRAME_EDITION_START";
    namespace.EVENT_EDITFRAME_EDITION_END = "EVENT_EDITFRAME_EDITION_END";

    var proto = EditFrame.prototype;

    /**
     * Draws a selection box with the given attributes
     *
     * @param {number} x - The x coordinate to place the selection box
     * @param {number} y - The y coordinate to place the selection box
     * @param {number} width - The width of the selection box
     * @param {number} height - The height of the selection box
     * @param {number} rotation - The amount of degrees to rotate the selection box
     */
    proto.setSelection = function (x, y, width, height, rotation) {

        updateSelectorBoxDimensions.bind(this)(width, height);
        updateSelectorBoxPosition.bind(this)(x, y, rotation);
        updateSelectionBoxState.bind(this)(true); //activate the selection box
        this.selectionLayer.style.visibility = 'visible';
    };

    /**
     * Displays the selection box based on the position, dimension, and rotation of a given markup
     *
     * @param {Autodesk.Viewing.Extensions.Markups.Core.Markup} markup - the markup that should appear as selected
     */
    proto.setMarkup = function (markup) {

        if(!markup) {
            if (this.markup) {
                this.markup = null;
                if (this.hammer) {
                    this.hammer.off("dragstart dragmove dragend", this.onHammerDragBinded);
                }
                updateSelectionBoxState.bind(this)(false);
            }
            return;
        }

        if (!this.markup && this.hammer) {
            this.hammer.on("dragstart dragmove dragend", this.onHammerDragBinded);
        }

        var size = markup.getClientSize(),
            position = markup.getClientPosition(),
            width = size.x,
            height = size.y,
            rotation = markup.getRotation();

        this.markup = markup;
        this.setSelection(position.x - (width / 2), position.y - (height / 2), width, height, rotation);

        this.enableResizeHandles();
        this.enableRotationHandle();

    };

    proto.startDrag = function () {

        this._onRepositionMouseDown(null, this.editor.getMousePosition());
    };

     proto.isActive = function() {
        return this.isDragging() || this.isResizing() || this.isRotating();
     };

    proto.isDragging = function () {

        return this.selection.dragging;
    };

    proto.isResizing = function () {

        return this.selection.resizing;
    };

    proto.isRotating = function () {

        return this.selection.rotating;
    };

    proto.onMouseMove = function (event) {

        //dummy fn
    };

    proto.onMouseUp = function (event) {
        //dummy fn
    };

     proto.onHammerDrag = function(event) {

         function updateEditorInput(input, parent, event) {

             //TODO: Change this when refactoring input in edit frame.
             var rect = parent.getBoundingClientRect();
             input.mousePosition.x = event.pageX - rect.left;
             input.mousePosition.y = event.pageY - rect.top;
         }

        //console.log('EditFrame drag ' + event.type);
         convertEventHammerToMouse(event);
         switch (event.type) {
             case 'dragstart':
                 updateEditorInput(this.editor.input, this.editor.svg, event);
                 // Check whether to translate, rotate or resize
                 if (isRotatePoint(event.target)) {
                     // Rotate
                     this._onRotationMouseDown(event);
                 } else if (isDragPoint(event.target)) {
                     // Resize
                     this._onResizeMouseDown(event);
                 } else {
                     this.startDrag();
                 }
                 event.preventDefault();
                 break;
             case 'dragmove':
                 updateEditorInput(this.editor.input, this.editor.svg, event);
                 this.onMouseMove(event);
                 event.preventDefault();
                 break;
             case 'dragend':
                 updateEditorInput(this.editor.input, this.editor.svg, event);
                 this.onMouseUp(event);
                 event.preventDefault();
                 break;
         }
     };

    proto.enableResizeHandles = function () {

        var markup = this.markup;
        var handle;

        if (markup.isHeightConstrained() || markup.isWidthConstrained()) {
            //hide all the handles
            for (var direction in this.selection.handle) {
                handle = this.selection.handle[direction];
                if(handle) handle.style.display = 'none';
            }

            //show only the resize points that are allowed
            if (markup.isHeightConstrained()) {
                this.selection.handle['w'].style.display = 'block';
                this.selection.handle['e'].style.display = 'block';
            }
            if (markup.isWidthConstrained()) {
                this.selection.handle['n'].style.display = 'block';
                this.selection.handle['s'].style.display = 'block';
            }
        } else {
            //no constraints, show all resize handles
            for (var direction in this.selection.handle) {
                handle = this.selection.handle[direction];
                if(handle) handle.style.display = 'block';
            }
        }
    };

    proto.enableRotationHandle = function () {

        var markup = this.markup;
        var handle = this.selection.rotationHandle;
        var display = markup.isRotationConstrained() ? 'none' : 'block';
        handle.style.display = display;
    };

     function convertEventHammerToMouse(event) {
         // Convert Hammer touch-event X,Y into mouse-event X,Y.
         event.pageX = event.pointers[0].clientX;
         event.pageY = event.pointers[0].clientY;
     }

    /**
     * Creates an element spanning the full height and width of its parent.
     * It serves as our surface to draw the selection box.
     *
     * @return {HTMLElement}
     */
    function createSelectionLayer() {

        var selectionLayer = document.createElement('div');
        selectionLayer.style.position = 'absolute';
        selectionLayer.style.top = 0;
        selectionLayer.style.bottom = 0;
        selectionLayer.style.left = 0;
        selectionLayer.style.right = 0;
        //don't let the selection box be visible outside the selection layer
        selectionLayer.style.overflow = 'hidden';
        selectionLayer.style.visibility = 'hidden';
        togglePointerEvents(selectionLayer, false);
        return selectionLayer;
    }

    /**
     * Creates a single drag point with the corresponding styles
     *
     * @param {number} diameter - The size of the drag point
     * @param {string} position - The cardinal(n, s, w, e) or ordinal(nw, nw, sw, se) direction of the point
     * @return {HTMLElement}
     */
    function createDragPoint(diameter, position) {

        var pointBorderWidth = 2;
        var point = document.createElement('div');
        point.style.position = 'absolute';
        point.style.backgroundColor = 'rgba(151, 151, 151, 1)';
        point.style.border = pointBorderWidth + 'px solid rgb(95, 98, 100)';
        point.style.height = diameter + 'px';
        point.style.width = diameter + 'px';
        point.style.borderRadius = (diameter / 2) + pointBorderWidth + 'px';
        point.style.boxSizing = 'border-box';
        setResizeCursor(point, position);
        point.className = 'selector-drag-point sdp-handle-' + position;
        point.setAttribute('data-sdp-handle', position);

        var placementOffset = -1 * ((diameter + pointBorderWidth) / 2);
        //set the position of the drag points based on the position
        switch (position) {
            case 'n':
                //wrap the point inside a wrapper so we can center it
                //using margin: 0 auto
                var wrapper = document.createElement('div');
                wrapper.style.position = 'absolute';
                wrapper.style.width = '100%';
                wrapper.style.height = diameter + 'px';
                wrapper.style.top = placementOffset + 'px';
                point.style.margin = '0 auto';
                point.style.position = '';

                wrapper.appendChild(point);
                point = wrapper;

                break;
            case 's':
                var wrapper = document.createElement('div');
                wrapper.style.position = 'absolute';
                wrapper.style.width = '100%';
                wrapper.style.height = diameter + 'px';
                wrapper.style.bottom = placementOffset + 'px';
                point.style.margin = '0 auto';
                point.style.position = '';

                wrapper.appendChild(point);
                point = wrapper;
                break;
            case 'w':
                point.style.left = placementOffset + 'px';
                point.style.top = '50%';
                point.style.transform = 'translate3d(0, -50%, 0)';
                break;
            case 'e':
                point.style.right = placementOffset + 'px';
                point.style.top = '50%';
                point.style.transform = 'translate3d(0, -50%, 0)';
                break;
            case 'nw':
                point.style.top = placementOffset + 'px';
                point.style.left = placementOffset + 'px';
                break;
            case 'ne':
                point.style.top = placementOffset + 'px';
                point.style.right = placementOffset + 'px';
                break;
            case 'sw':
                point.style.bottom = placementOffset + 'px';
                point.style.left = placementOffset + 'px';
                break;
            case 'se':
                point.style.bottom = placementOffset + 'px';
                point.style.right = placementOffset + 'px';
                break;
        }
        return point;
    }

    function createRotatePoint (diameter) {

        var pointBorderWidth = 2;
        var point = document.createElement('div');
        point.style.position = 'absolute';
        point.style.backgroundColor = 'aqua';
        point.style.border = pointBorderWidth + 'px solid rgb(95, 98, 100)';
        point.style.height = diameter + 'px';
        point.style.width = diameter + 'px';
        point.style.borderRadius = (diameter / 2) + pointBorderWidth + 'px';
        point.style.boxSizing = 'border-box';
        point.classList.add('selector-rotate-point');
        point.style.left = '50%';
        point.style.transform = 'translate3d(-50%, 0px, 0px)';
        point.style.top = '-25px';
        return point;
    }

    function setResizeCursor (element, direction) {

        var cursor;
        switch(direction) {
            case 'n':
            case 's':
                cursor = 'ns-resize';
                break;
            case 'w':
            case 'e':
                cursor = 'ew-resize';
                break;
            case 'ne':
            case 'sw':
                cursor = 'nesw-resize';
                break;
            case 'nw':
            case 'se':
                cursor = 'nwse-resize';
                break;
        }
        element.style.cursor = cursor;
    }

    /**
     * Creates the 8 drag points of the selection box.
     *
     * @this EditFrame
     */
    function createDragPoints(selector) {

        var pointDiameter = 12;

        ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'].forEach(function (direction) {
            //store the drag point and put it in the DOM
            this.selection.handle[direction] = createDragPoint(pointDiameter, direction);
            selector.appendChild(this.selection.handle[direction]);
        }.bind(this));
    }

    /**
     * Determines if an element is a drag point
     *
     * @return {boolean}
     */
    function isDragPoint(element) {

        return matchesSelectorAux(element, '.selector-drag-point');
    }

    /**
     * Determines if an element is a rotate point
     *
     * @return {boolean}
     */
    function isRotatePoint(element) {

        return matchesSelectorAux(element, '.selector-rotate-point');
    }

    /**
     * Creates the element that will be used as the selection box. It also
     * takes care of adding the drag handles
     *
     * @return {HTMLElement} - the selection box
     * @this EditFrame
     */
    function createSelectorBox() {

        var borderWidth = 1;
        var borderColor = 'rgb(0, 0, 255)';
        var selectorBox = document.createElement('div');
        selectorBox.style.position = 'absolute';
        selectorBox.style.border = borderWidth + 'px solid ' + borderColor;
        selectorBox.style.zIndex = 1;
        selectorBox.style.cursor = 'move';
        selectorBox.style.boxSizing = 'border-box';
        togglePointerEvents(selectorBox, true);
        selectorBox.classList.add('selector-box');
        createDragPoints.bind(this)(selectorBox);
        this.selection.rotationHandle = createRotatePoint(12);
        selectorBox.appendChild(this.selection.rotationHandle);
        //store the selector box
        this.selection.element = selectorBox;

        //add the selection box to the selection layer
        this.selectionLayer.appendChild(this.selection.element);

        //we are just creating the box, start it out hidden
        updateSelectionBoxState.bind(this)(false);

        return selectorBox;
    }

    /**
     * Utility to create the CSS translate3d value from a given 2d point
     *
     * @param {number} x - coordinate
     * @param {number} y - coordinate
     * @return {string}
     */
    function toTranslate3d(x, y) {

        return 'translate3d(' + x + 'px,' + y + 'px,0)';
    }


    /**
     * Updates the display state of the selection box
     *
     * @param {boolean} active - The new state of the the selection box
     * @this EditFrame
     */
    function updateSelectionBoxState(active) {

        this.selection.active = active;
        this.selection.element.style.display = active ? 'block' : 'none';
    }

    /**
     * Updates the position and rotation of the selection box.
     *
     * @param {number} x - The x coordinate to place the selection box
     * @param {number} y - The y coordinate to place the selection box
     * @param {number} rotation - The amount of degrees to rotate the selection box
     * @this EditFrame
     */
    function updateSelectorBoxPosition(x, y, rotation) {

        this.selection.x = x;
        this.selection.y = y;
        this.selection.rotation = rotation;
        var size = this.markup.getClientSize();
        //TODO: consider DomElementStyle

        this.selection.element.style.msTransform = toTranslate3d(x, y) + ' rotate(' + rotation + 'rad)';
        this.selection.element.style.msTransformOrigin = (size.x / 2) + 'px ' + (size.y / 2) + 'px';
        this.selection.element.style.webkitTransform = toTranslate3d(x, y) + ' rotate(' + rotation + 'rad)';
        this.selection.element.style.webkitTransformOrigin = (size.x / 2) + 'px ' + (size.y / 2) + 'px';
        this.selection.element.style.transform = toTranslate3d(x, y) + ' rotate(' + rotation + 'rad)';
        this.selection.element.style.transformOrigin = (size.x / 2) + 'px ' + (size.y / 2) + 'px';
    }

    /**
     * Updates the dimensions of the selection box (width and height).
     *
     * @param {number} width - The new width of the selection box
     * @param {number} height - The new height of the selection box
     * @this EditFrame
     */
    function updateSelectorBoxDimensions(width, height) {

        this.selection.width = width;
        this.selection.height = height;
        this.selection.element.style.width = width + 'px';
        this.selection.element.style.height = height + 'px';
    }

    /**
     * Attaches all the necessary listeners to handle a drag action.
     *
     * @this EditFrame
     */
    function handleSelectionBoxDragging () {

        this.selection.element.addEventListener('mousedown', this._onRepositionMouseDown.bind(this));
    }

    proto._onRepositionMouseDown = function (event, cursor) {

        //a synthetic start means that the event was triggered manually and not as a
        //result of a mousedown on the edit frame
        var syntheticStart = !(event instanceof MouseEvent);

        //during a real mousedown, ignore events originating from a resizing handle
        if (!syntheticStart && (isDragPoint(event.target) || isRotatePoint(event.target))) return;

        this.editor.beginActionGroup();
        this.selection.dragging = true;

        //get the cursor position
        cursor = syntheticStart ?  cursor : this.editor.getMousePosition();

        //store the initial cursor and axis constrains
        this.initialCursor = cursor;
        this.initialPosition = this.markup.getClientPosition();
        this.areAxisConstrained = false;
        this.axisConstrains = new THREE.Vector2(1,1);

        //update the function that will handle the mousemove and mouseup events
        this.onMouseMove = this._onRepositionMouseMove.bind(this);
        this.onMouseUp = this._onRepositionMouseUp.bind(this);

        //if alt down I drop a clone.
        if (event && event.altKey) {
            var editor = this.editor;
            var cloneMarkup = new namespace.CloneMarkup(editor, editor.getId(), this.markup, this.markup.position);
            cloneMarkup.execute();
        }

        this.fireEvent({ type: namespace.EVENT_EDITFRAME_EDITION_START }); // Moving around
    };

    proto._onRepositionMouseMove = function (event) {

        //ignore mousemove events if the dragging state hasn't been activated
        if (!this.selection.dragging) return;

        //get the position of the cursor relative to selection layer
        var cursor = this.editor.getMousePosition();


        //constrain axis if shift key is down.
        var constrainAxis = this.editor.input.constrainAxis;
        if (this.areAxisConstrained !== constrainAxis) {
            this.areAxisConstrained = constrainAxis;
            this.axisConstrains = constrainAxis ? new THREE.Vector2(0, 0) : new THREE.Vector2(1,1);

            this.initialPosition.x += cursor.x - this.initialCursor.x;
            this.initialPosition.y += cursor.y - this.initialCursor.y;

            this.initialCursor.x = cursor.x;
            this.initialCursor.y = cursor.y;
        }

        //determine how many pixel we have to shift the
        //selection box to keep the cursor on the drag point
        var movement = {
            x: cursor.x - this.initialCursor.x,
            y: cursor.y - this.initialCursor.y
        };

        var deadZone = 15;
        if (this.axisConstrains.x === 0 && this.axisConstrains.y === 0) {

            if (Math.abs(movement.x) > deadZone) {
                this.axisConstrains.x = 1;
                movement.x += movement.x < 0 ?  deadZone : -deadZone;
            } else
            if (Math.abs(movement.y) > deadZone) {
                this.axisConstrains.y = 1;
                movement.y += movement.y < 0 ?  deadZone : -deadZone;
            }
        }

        var x = this.initialPosition.x + movement.x * this.axisConstrains.x;
        var y = this.initialPosition.y + movement.y * this.axisConstrains.y;

        updateSelectorBoxPosition.bind(this)(x, y, this.selection.rotation);

        //tell the markup to start transforming
        //the markup expects an (x, y) coordinate that
        //uses an origin at the center, adjust our x, y because
        //our origin starts at the top left
        var position = this.editor.positionFromClientToMarkups(x, y);
        var setPosition = new namespace.SetPosition(this.editor, this.markup, position);
        setPosition.execute();
    };

    proto._onRepositionMouseUp = function () {

        this.last = null;

        //this should never be called after the mouse up because we are no longer repositioning
        this.onMouseMove = function () {/*do nothing*/};
        this.onMouseUp = function () {/*do nothing*/};

        if(!this.selection.dragging) {
            return;
        }

        this.editor.closeActionGroup();
        this.selection.dragging = false;
        this.fireEvent({ type: namespace.EVENT_EDITFRAME_EDITION_END }); // Moving around
    };

    proto._onResizeMouseDown = function (event) {
        var target = event.target;

        //is the target where the mousedown occurred a drag point
        if (!isDragPoint(target)) {
            return;
        }

        this.selection.resizing = true;
        //keep a reference to the point where the drag started
        this.selection.handle.resizing = target;
        //figure out which direction this point should resize
        var direction = this.selection.handle.resizing.getAttribute('data-sdp-handle');
        //set the cursor position for the entire layer
        this.containingDiv.style.cursor = direction + '-resize';

        var cursor = this.editor.getMousePosition();

        var position = this.markup.getClientPosition();
        var size = this.markup.getClientSize();

        //store the center
        this.initial = {
            x: position.x,
            y: position.y,
            width: size.x,
            height: size.y,
            mouseX: cursor.x,
            mouseY: cursor.y
        };

        this.onMouseMove = this._onResizeMouseMove.bind(this);
        this.onMouseUp = this._onResizeMouseUp.bind(this);

        //notify the markup that dragging has started
        this.editor.beginActionGroup();
        this.fireEvent({ type: namespace.EVENT_EDITFRAME_EDITION_START }); // Resizing
    };

    proto._onResizeMouseMove = function (event) {

        if (!this.selection.resizing) return;

        var cursor = this.editor.getMousePosition();
        var initial = this.initial;

        var movement = {
            x: cursor.x - initial.mouseX,
            y: cursor.y - initial.mouseY
        };

        var vector = new THREE.Vector3(movement.x, movement.y, 0);
        var undoRotation = new THREE.Matrix4().makeRotationZ(-this.selection.rotation);
        movement = vector.applyMatrix4(undoRotation);

        var x = initial.x,
            y = initial.y,
            width = initial.width,
            height = initial.height;

        var localSpaceDelta = new THREE.Vector3();

        //get the direction of the arrow being dragged
        var direction = this.selection.handle.resizing.getAttribute('data-sdp-handle');

        // TODO: Make a mechanism to configure and use this feature from Markups Core.
        // If shift is pressed, figure aspect ratio is maintained.
        if (this.editor.input.keepAspectRatio && ['nw', 'ne', 'sw', 'se'].indexOf(direction) !== -1) {

            var delta = new THREE.Vector3(movement.x, movement.y, 0);
            switch (direction){
                case 'nw': movement.set(-initial.width,-initial.height, 0); break;
                case 'ne': movement.set( initial.width,-initial.height, 0); break;
                case 'sw': movement.set( initial.width,-initial.height, 0); break;
                case 'se': movement.set( initial.width, initial.height, 0); break;
            }
            movement.normalize();
            movement = delta.projectOnVector(movement);
        }

        var translations = {
            n: function () {
                height -= movement.y;
                localSpaceDelta.y = movement.y;
            },
            s: function () {
                height += movement.y;
                localSpaceDelta.y = movement.y;
            },
            w: function () {
                width -= movement.x;
                localSpaceDelta.x = movement.x;
            },
            e: function () {
                width += movement.x;
                localSpaceDelta.x = movement.x;
            },
            nw: function () {
                this.n();
                this.w();
            },
            ne: function () {
                this.n();
                this.e();
            },
            sw: function () {
                this.s();
                this.w();
            },
            se: function () {
                this.s();
                this.e();
            }
        };

        translations[direction]();

        var redoRotation = new THREE.Matrix4().makeRotationZ(this.selection.rotation);
        var actualDelta = localSpaceDelta.applyMatrix4(redoRotation);

        var newPos = this.editor.positionFromClientToMarkups(
            x + (actualDelta.x * 0.5),
            y + (actualDelta.y * 0.5));

        var newSize = this.editor.sizeFromClientToMarkups(width, height);
        var setSize = new namespace.SetSize(this.editor, this.markup, newPos, newSize.x, newSize.y);
        setSize.execute();
    };

    proto._onResizeMouseUp = function (event) {
        this.selection.resizing = false;
        this.selection.handle.resizing = null;
        this.containingDiv.style.cursor = '';

        this.editor.closeActionGroup();
        this.fireEvent({ type: namespace.EVENT_EDITFRAME_EDITION_END }); // Resizing

        //this should never be called after the mouse up because we are no longer resizing
        this.onMouseMove = function () {/*do nothing*/
        };
        this.onMouseUp = function () {/*do nothing*/
        };
    };


    /**
     * Attaches all the necessary listeners to handle a resizing action.
     *
     * @this EditFrame
     */
    function handleSelectionBoxResizing() {
        this.selectionLayer.addEventListener('mousedown', this._onResizeMouseDown.bind(this));
    }

    function handleSelectionBoxRotating () {

        this.selection.element.addEventListener('mousedown', this._onRotationMouseDown.bind(this));
    }

    var initialRotation;
    var initialHandlePosition;

    proto._onRotationMouseDown = function (event) {

        //ignore anything not coming from the rotation point
        if (!isRotatePoint(event.target)) return;

        this.editor.beginActionGroup();
        this.selection.rotating = true;

        //store the initial cursor
        initialHandlePosition = this.editor.getMousePosition();

        initialRotation = this.selection.rotation || 0;

        //update the function that will handle the mousemove and mouseup events
        this.onMouseMove = this._onRotationMouseMove.bind(this);
        this.onMouseUp = this._onRotationMouseUp.bind(this);

        this.fireEvent({ type: namespace.EVENT_EDITFRAME_EDITION_START }); // Rotating
    };

     proto._onRotationMouseMove = function (event) {

        //ignore mousemove events if the dragging state hasn't been activated
        if (!this.selection.rotating) return;

        var cursor = this.editor.getMousePosition();
        var position = this.markup.getClientPosition();

        var r = getAngleBetweenPoints(position, cursor);
        var r2 = getAngleBetweenPoints(position, initialHandlePosition);
        var rotation = r - r2 + initialRotation;

        // TODO: Make a mechanism to configure and use this feature from Markups Core.
        if (this.editor.input.snapRotations) {
            var snap = namespaceUtils.degreesToRadians(22.5);
            rotation = Math.ceil(rotation / snap) * snap;
        }

         //pass rotation as degrees
         updateSelectorBoxPosition.bind(this)(this.selection.x, this.selection.y, rotation);

        //convert to radians
        var setRotation = new namespace.SetRotation(this.editor, this.markup, rotation);
        setRotation.execute();
    };

    proto._onRotationMouseUp = function (event) {

        this.selection.rotating = false;
        initialRotation = null;
        initialHandlePosition = null;
        this.editor.closeActionGroup();
        this.fireEvent({ type: namespace.EVENT_EDITFRAME_EDITION_END }); // Rotating
    };

    /**
     * Attaches double click listener and pass events to markup, markups such as text use it to enter text edit
     * mode.
     *
     * @this EditFrame
     */
    function handleSelectionDoubleClick() {

        var doubleClick = function (event) {
            this.selection.dragging = false;
            var editMode = this.editor.editMode;
            editMode && editMode.onDoubleClick(this.markup);
        }.bind(this);

        var selectorBoxWrapper = this.selectionLayer;
        selectorBoxWrapper.addEventListener('dblclick', doubleClick);
    }

    function togglePointerEvents(element, state) {

        element.style.pointerEvents = state ? 'auto' : 'none';
    }

    function getAngleBetweenPoints (p1, p2) {

        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    }

     function matchesSelectorAux(domElem, selector) {
         if (domElem.matches) return domElem.matches(selector); //Un-prefixed
         if (domElem.msMatchesSelector) return domElem.msMatchesSelector(selector);  //IE
         if (domElem.mozMatchesSelector) return domElem.mozMatchesSelector(selector); //Firefox (Gecko)
         if (domElem.webkitMatchesSelector) return domElem.webkitMatchesSelector(selector); // Opera, Safari, Chrome
         return false;
     }

     namespace.EditFrame = EditFrame;

 })();

Autodesk.Viewing.Extensions.Markups.Core.Utils.Localization = {

    MARKUP_TEXT_DEFAULT_TEXT: 'Write something...'
};

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * @class
     * Base class for all Markups.<br>
     * A Markup is a class that is capable of rendering itself as an Svg node.<br>
     * It can also render itself into a canvas-2d context.
     * Component within {@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore MarkupsCore} extension.
     *
     * Any class extending Markup should contain at least the following methods:
     * - getEditMode()
     * - set()
     * - updateStyle()
     * - setParent()
     * - setRotation()
     * - setSize()
     * - setPosition()
     * - renderToCanvas()
     * - setMetadata()
     *
     * A good reference is the rectangle markup implementation available in
     * [MarkupRectangle.js]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupRectangle}.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     *
     * @param {number} id - Identifier, populated with return value of {@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#getId getId()}.
     * @param {Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore} editor - Markups extension
     * @param {Array} styleAttributes - Attributes for customization. Related to {@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#setStyle setStyle()}.
     * @constructor
     */
    function Markup(id, editor, styleAttributes) {

        this.id = id;
        this.type = 0;
        this.editor = editor;
        this.viewer = editor.viewer;
        this.position = {x: 0, y: 0};
        this.size = {x:0, y:0};
        this.rotation = 0;
        this.style = namespaceUtils.createStyle(styleAttributes, this.viewer);
        this.highlightColor = '#FAFF3C';
        this.constraintWidth = false;
        this.constraintHeight = false;
        this.constraintRotation = false;
        this.highlighted = false;
        this.selected = false;

        namespaceUtils.addTraitEventDispatcher(this);
    }

    /*
     * Constants
     */
    namespace.MARKUP_TYPE_ARROW = 1;
    namespace.MARKUP_TYPE_TEXT = 2;
    namespace.MARKUP_TYPE_RECTANGLE = 3;
    namespace.MARKUP_TYPE_CIRCLE = 4;
    namespace.MARKUP_TYPE_CLOUD = 5;
    namespace.MARKUP_TYPE_FREEHAND = 6;

    namespace.MARKUP_EXPORT_TYPE_LABEL = 'Label';
    namespace.MARKUP_EXPORT_TYPE_ARROW = 'Arrow';
    namespace.MARKUP_EXPORT_TYPE_RECTANGLE = 'Rectangle';
    namespace.MARKUP_EXPORT_TYPE_CIRCLE = 'Circle';
    namespace.MARKUP_EXPORT_TYPE_CLOUD = 'Cloud';
    namespace.MARKUP_EXPORT_TYPE_FREEHAND = 'Freehand';

    /*
     * Event types
     */
    namespace.EVENT_EDITMODE_CHANGED = "EVENT_EDITMODE_CHANGED";

    namespace.EVENT_MARKUP_SELECTED = "EVENT_MARKUP_SELECTED";
    namespace.EVENT_MARKUP_DRAGGING = "EVENT_MARKUP_DRAGGING";
    namespace.EVENT_MARKUP_ENTER_EDITION = "EVENT_MARKUP_ENTER_EDITION";
    namespace.EVENT_MARKUP_CANCEL_EDITION = "EVENT_MARKUP_CANCEL_EDITION";
    namespace.EVENT_MARKUP_DELETE_EDITION = "EVENT_MARKUP_DELETE_EDITION";

    var proto = Markup.prototype;
    namespace.Markup = Markup;

    proto.destroy = function() {

    };

    /**
     * Clones (deep-copy) the markup. Used internally by the copy/cut/paste mechanism in
     * {@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore MarkupsCore}.
     *
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.Markup} clone of the current markup
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.clone = function() {

        var clone = Object.create(this.__proto__);
        var overrides = this.getCloneOverrides();

        for (var name in this) {

            if(!this.hasOwnProperty(name)) {
                continue;
            }

            var member = this[name];

            // Is there an override for this member?
            if (overrides.hasOwnProperty(name)) {
                clone[name] = overrides[name];
                continue;
            }

            // Member has a clone function?
            if (member['clone'] instanceof Function) {
                clone[name] = member.clone();
                continue;
            }

            // Is it a function?
            if (member instanceof Function) {
                clone[name] = member.bind(clone);
                continue;
            }

            // Is it an html node?
            if (member.nodeType) {
                clone[name] = member.cloneNode(true);
                continue;
            }

            // Just a plain object?
            if (member instanceof Object) {
                clone[name] = JSON.parse(JSON.stringify(member));
                continue;
            }

            // Ok, it seems it's just a primitive type.
            clone[name] = member;
        }

        clone.bindDomEvents();
        return clone;
    };

    /**
     * Used internally by
     * {@link Autodesk.Viewing.Extensions.Markups.Core.Markup#clone clone()},
     * provides a mechanism to avoid cloning specific attributes.<br>
     * Developers only need to override this method when creating new Markup types.
     * When overriding, first call the super() implementation and then include additional attribute/value pairs to it.
     * @returns {Object} containing attributes that need not to be cloned.
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.getCloneOverrides = function() {

        return {
            viewer: this.viewer,
            editor: this.editor,
            hammer: null,
            listeners: {}
        }
    };

    /**
     * Used internally to select a markup.<br>
     * Fires event Autodesk.Viewing.Extensions.Markups.Core.EVENT_MARKUP_SELECTED.
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.select = function () {

        if (this.selected) {
            return;
        }

        this.selected = true;
        this.highlighted = false;
        this.updateStyle();
        this.fireEvent({type: namespace.EVENT_MARKUP_SELECTED, markup: this});
    };

    /**
     * Used internally to signal that the current markup has been unselected.<br>
     * No event is fired.
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.unselect = function() {

        this.selected = false;
    };

    proto.highlight = function(highlight) {

        if (this.interactionsDisabled) {
            return;
        }

        this.highlighted = highlight;
        this.updateStyle();
    };

    /**
     * Returns a copy of the markup's style.
     * @returns {Object}
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.getStyle = function() {

        return namespaceUtils.cloneStyle(this.style);
    };

    /**
     * Used internally to set the style object. Triggers a re-render of the markup (Svg)
     * @param {Object} style - Dictionary with key/value pairs
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.setStyle = function(style) {

        namespaceUtils.copyStyle(style, this.style);
        this.updateStyle();
    };

    /**
     * Used internally and implemented by specific Markup types to render themselves as Svg.
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.updateStyle = function () {

    };

    /**
     * Used internally to notify the markup that it is no longer being dragged (moved).<br>
     * Fires event Autodesk.Viewing.Extensions.Markups.Core.EVENT_MARKUP_DRAGGING.
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.finishDragging = function() {

        this.fireEvent({type: namespace.EVENT_MARKUP_DRAGGING, markup: this, dragging: false});
    };

    /**
     * Used internally to notify the markup that it is now being edited.<br>
     * Fires event Autodesk.Viewing.Extensions.Markups.Core.EVENT_MARKUP_ENTER_EDITION.
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.edit = function() {

        this.fireEvent({type: namespace.EVENT_MARKUP_ENTER_EDITION, markup: this});
    };

    /**
     * Used internally to signal that it is no longer being edited.<br>
     * Fires event Autodesk.Viewing.Extensions.Markups.Core.EVENT_MARKUP_CANCEL_EDITION.
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.cancel = function() {

        this.fireEvent({type: namespace.EVENT_MARKUP_CANCEL_EDITION, markup: this});
    };

    /**
     * Used internally to signal that the markup is being deleted.<br>
     * Fires event Autodesk.Viewing.Extensions.Markups.Core.EVENT_MARKUP_DELETE_EDITION.
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.deleteMarkup = function() {

        this.fireEvent({type: namespace.EVENT_MARKUP_DELETE_EDITION, markup: this});
    };

    proto.setParent = function(parent) {
    };

    proto.setPosition = function(x, y) {
    };

    /**
     * Used internally to get the {@link Autodesk.Viewing.Extensions.Markups.Core.EditMode EditMode}
     * associated with the current Markup.<br>
     * Implemented by classes extending this one.
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.EditMode}
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.getEditMode = function() {

        console.warn('EditMode of markup type' + namespaceUtils.getTypeString(this.type) + ' not defined.' );
        return null;
    };

    /**
     * Used internally to get the markup's position in browser pixel space.<br>
     * Notice that (0,0) is top left.<br>
     * See also
     * [getClientSize()]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup#getClientSize}.
     * @returns {*}
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.getClientPosition = function() {

        var position = this.position;
        return this.editor.positionFromMarkupsToClient(position.x, position.y);
    };

    /**
     * Used internally to get the markup's bounding rect in browser pixel space.<br>
     * See also
     * [getClientPosition()]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup#getClientPosition}.
     * @returns {*}
     */
    Autodesk.Viewing.Extensions.Markups.Core.Markup.prototype.getClientSize = function () {

        var size = this.size;
        return this.editor.sizeFromMarkupsToClient(size.x, size.y);
    };

    proto.setRotation = function(angle) {

    };

    proto.getRotation = function () {

        return this.rotation;
    };

    proto.setSize = function(position, size) {

    };

    proto.isWidthConstrained = function() {

        return this.constraintWidth;
    };

    proto.isHeightConstrained = function() {

        return this.constraintHeight;
    };

    proto.isRotationConstrained = function() {

        return this.constraintRotation;
    };

    /**
     * Used to disable highlight on annotations while a new annotation is being created.
     * @param {Boolean} disable - Whether (mouse) interactions are enable.
     */
    proto.disableInteractions = function(disable) {

        this.interactionsDisabled = disable;
    };

    /**
     *
     * @param width
     */
    proto.setStrokeWidth = function(width) {

    };

    proto.constrainsToBounds = function(bounds) {

    };

    proto.onMouseDown = function(event) {

        this.select();
        this.editor.editFrame.startDrag();
    };

    /**
     * Implemented by extending classes.<br>
     * Gets called automatically when
     * [generateData()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#generateData}
     * @returns {null|Element} - Either null (default) or the metadata Svg node
     */
    proto.setMetadata = function() {

        return null; // No metadata is injected by default.
    };

    proto.bindTouchEvents = function(domElement) {
        this.hammer = new Hammer.Manager(domElement, {
            recognizers: [
                [Hammer.Tap, { event: 'singletap', pointers: 1, threshold: 2 } ]
            ],
            inputClass: Hammer.TouchInput
        });

        this.onSingleTapBinded = function(event) {
            this.onMouseDown(event);
        }.bind(this);
        this.hammer.on("singletap", this.onSingleTapBinded);
    };

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param id
     * @param editor
     * @constructor
     */
    function MarkupArrow(id, editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity'];
        namespace.Markup.call(this, id, editor, styleAttributes);

        this.type = namespace.MARKUP_TYPE_ARROW;
        this.constraintHeight = true;

        // Create head and tail.
        this.head = new THREE.Vector3();
        this.tail = new THREE.Vector3();
        this.size.y = this.style['stroke-width'] * 2;

        this.createSVG();
        this.bindDomEvents();
    }

    MarkupArrow.prototype = Object.create(namespace.Markup.prototype);
    MarkupArrow.prototype.constructor = MarkupArrow;

    var proto = MarkupArrow.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeArrow(this.editor);
    };

    /**
     * Creates the DOM elements user will see and interact with.
     */
    proto.createSVG = function () {

        this.shape = namespaceUtils.createSvgElement('polygon');
    };

    proto.bindDomEvents = function() {
        if (namespaceUtils.isTouchDevice()) {
            this.bindTouchEvents(this.shape);
        }
        this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
        this.shape.addEventListener("mouseout", function () { this.highlight(false); }.bind(this));
        this.shape.addEventListener("mouseover", function () { this.highlight(true); }.bind(this));
    };

    /**
     * Sets top-left and bottom-right values in client space coordinates (2d).
     * Notice that for the arrow, the top left is the "tail" of the arrow and
     * the bottom right is the "head" of it.
     *
     * @param {Number} xO - tail
     * @param {Number} yO - tail
     * @param {Number} xF - head
     * @param {Number} yF - head
     */
    proto.set = function (xO, yO, xF, yF) {

        var vO = new THREE.Vector2(xO, yO);
        var vF = new THREE.Vector2(xF, yF);
        var vDir = vF.clone().sub(vO).normalize();

        this.size.x = vO.distanceTo(vF); // TODO: Clamp min length
        this.rotation = Math.acos(vDir.dot(new THREE.Vector2(1,0)));
        this.rotation = yF > yO ? (Math.PI*2)-this.rotation : this.rotation;

        this.head.set(xO, yO, 0);
        this.tail.set(xF, yF, 0);

        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Changes the rotation of the markup to the given angle.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetRotation edit action
     *
     * @param {Number} angle
     */
    proto.setRotation = function(angle) {

        this.rotation = angle;
        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Changes the position and size of the markup.
     * This gets called by the namespace.SetSize edit action
     * @param {{x: Number, y: Number}} position - arrow's center
     * @param {Number} width - Arrow's length
     * @param {Number} height - We ignore this one because we use the arrow's stroke width instead
     */
    proto.setSize = function(position, width, height) {

        var xF = Math.cos(this.rotation);
        var yF = Math.sin(this.rotation);
        var vFDir = new THREE.Vector2(xF, yF); // already normalized
        vFDir.multiplyScalar(width*0.5);

        var vCenter = new THREE.Vector2(position.x, position.y);
        var vO = vCenter.clone().add(vFDir);
        var vF = vCenter.clone().sub(vFDir);

        this.head.set(vF.x, vF.y, 0);
        this.tail.set(vO.x, vO.y, 0);
        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = width;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Given the 3d positions for top-left and bottom-right, it recalculates
     * all the 2d values in client space.
     */
    proto.updateTransformMatrix = function() {

        var head = this.head;
        var tail = this.tail;
        var mid_x = this.size.x * 0.5;
        var mid_y = this.style['stroke-width'];
        var pos_x = (head.x + tail.x) * 0.5;
        var pos_y = (head.y + tail.y) * 0.5;

        // Used by updateStyle()
        this.transformSvg = [
            'translate(', pos_x, ',', pos_y, ') ',
            'rotate(', namespaceUtils.radiansToDegrees(-this.rotation), ') ',
            'translate(', -mid_x, ',', -mid_y, ') '
        ].join('');

        // Update values used by EditFrame and Undo/Redo system //
        this.position.x = tail.x + (head.x - tail.x) * 0.5;
        this.position.y = tail.y + (head.y - tail.y) * 0.5;
    };

    proto.updateStyle = function() {

        // Update size and transform,
        this.size.y = this.style['stroke-width'] * 2;
        this.updateTransformMatrix();

        // Update style.
        var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];

        var polygonPoints = this.getPolygonPoints();
        // Transform points into SVG compliant format
        // Meaning: 'x1,y1 x2,y2 ... x8,y8 x9,y9'
        var mappedPoints = polygonPoints.map(function(point){
            return point[0]+','+point[1];
        });
        var polygonStr = mappedPoints.join(' '); // Leave a space between points
        this.shape.setAttribute('points', polygonStr);
        this.shape.setAttribute("transform", this.transformSvg);
        this.shape.setAttribute('fill', strokeColor);
        this.shape.setAttribute('opacity', this.style['stroke-opacity']);
    };

    /**
     * Generates a list of points that compose the arrow's visuals
     * @return {Array} Where each element is an array with 2 values: [x, y]
     * @private
     */
    proto.getPolygonPoints = function() {

        // To build the arrow we need 7 points in total
        // The 'default' arrow built here has the following characteristics:
        //
        // 1. It is built horizontally facing right
        // 2. It's bounding rectangle has length: this.size.x
        // 3. It's bounding rectangle has height: 2 * this.strokeWidth
        // 4. The arrow tail's thickness is: this.strokeWidth
        // 5. The arrow head's length is: 2/3 of (point 3)
        // 6. The arrow head's thickness is: (point 3)
        // 7. The arrow generated is centered in its local (0,0), meaning that
        //    two points are placed with negative x values, and all other have
        //    positive x values:
        //
        //                             (3)
        //                              |  \
        //             (1)-------------(2)   \
        //              |         (0)        (4)
        //             (7)-------------(6)   /
        //                              |  /
        //                             (5)
        //

        var strokeWidth = this.style['stroke-width'];
        var half_len = this.size.x * 0.5;
        var thickness = strokeWidth;
        var half_thickness = strokeWidth * 0.5;
        var head_len = half_len - (1.2 * thickness);

        // Left side points
        var p1 = [ -half_len, -half_thickness ];
        var p7 = [ -half_len,  half_thickness ];

        // The tip
        var p4 = [ half_len, 0];

        // Right side points (from top to bottom)
        var p3 = [ head_len, -thickness ];
        var p2 = [ head_len, -half_thickness ];
        var p6 = [ head_len,  half_thickness ];
        var p5 = [ head_len,  thickness ];

        var points = [p1, p2, p3, p4, p5, p6, p7];

        // TODO: The created arrow should have its (0,0) on the top left
        // TODO: This was an oversight, and for now we fix it by offsetting before returning.
        points.forEach(function(point) {
            point[0] += half_len;
            point[1] += thickness;
        });

        return points;
    };

    /**
     * Specifies the parent layer which will contain the markup.
     * @param {HTMLElement} parent
     */
    proto.setParent = function (parent) {

        var div = this.shape;
        div.parentNode && div.parentNode.removeChild(div);
        parent && parent.appendChild(div);
    };

    /**
     * Used by the EditFrame to move the markup in Client Space coordinates
     * @param {Number} x - New X location for the markup. Notice that markups are centered on this value.
     * @param {Number} y - New Y location for the markup. Notice that markups are centered on this value.
     */
    proto.setPosition = function (x, y) {

        var head = this.head;
        var tail = this.tail;

        var dx = head.x - tail.x;
        var dy = head.y - tail.y;

        var xo = x - dx * 0.5;
        var yo = y - dy * 0.5;

        head.x = xo;
        head.y = yo;

        tail.x = xo + dx;
        tail.y = yo + dy;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    proto.created = function () {
    };

    proto.destroy = function () {

        this.unselect();
        this.setParent(null);
    };

    /**
     *
     * @param bounds
     */
    proto.constrainsToBounds = function (bounds) {

    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = "arrow";
        metadata.head = [this.head.x, this.head.y].join(" ");
        metadata.tail = [this.tail.x, this.tail.y].join(" ");
        metadata.rotation = String(this.rotation);

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    proto.renderToCanvas = function(ctx) {

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.style['stroke-color'];
        var strokeOpacity = this.style['stroke-opacity'];

        var head = this.head;
        var tail = this.tail;
        var mid_x = this.size.x * 0.5;
        var mid_y = strokeWidth;
        var pos_x = (head.x + tail.x) * 0.5;
        var pos_y = (head.y + tail.y) * 0.5;
        var clientMid = this.editor.positionFromMarkupsToClient(mid_x, mid_y);
        var clientPos = this.editor.positionFromMarkupsToClient(pos_x, pos_y);
        var m1 = new THREE.Matrix4().makeTranslation(-clientMid.x, -clientMid.y, 0);
        var m2 = new THREE.Matrix4().makeRotationZ(this.rotation);
        var m3 = new THREE.Matrix4().makeTranslation(clientPos.x, clientPos.y, 0);
        var transform = m3.multiply(m2).multiply(m1);

        var points = this.getPolygonPoints();
        ctx.fillStyle = namespaceUtils.composeRGBAString(strokeColor, strokeOpacity);
        ctx.beginPath();
        var that = this;
        points.forEach(function(point){
            var x = point[0], y = point[1];
            var client = that.editor.positionFromMarkupsToClient(x, y);
            client = client.applyMatrix4(transform);
            ctx.lineTo(client.x, client.y);
        });
        ctx.fill();
    };

    namespace.MarkupArrow = MarkupArrow;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param id
     * @param editor
     * @constructor
     */
    function MarkupCircle(id, editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.Markup.call(this, id, editor, styleAttributes);

        this.type = namespace.MARKUP_TYPE_CIRCLE;

        this.createSVG();
        this.bindDomEvents();
    }

    MarkupCircle.prototype = Object.create(namespace.Markup.prototype);
    MarkupCircle.prototype.constructor = MarkupCircle;

    var proto = MarkupCircle.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeCircle(this.editor);
    };

    proto.createSVG = function() {
        this.shape = namespaceUtils.createSvgElement('ellipse');
    };

    proto.bindDomEvents = function() {
        if (namespaceUtils.isTouchDevice()) {
            this.bindTouchEvents(this.shape);
        }
        this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
        this.shape.addEventListener("mouseout", function(){ this.highlight(false); }.bind(this));
        this.shape.addEventListener("mouseover", function(){ this.highlight(true); }.bind(this));
    };

    /**
     * Sets top-left and bottom-right values in client space coordinates (2d).
     * @param {Object} position
     * @param {Object} size
     */
    proto.set = function(position, size) {

        this.rotation = 0; // Reset angle //

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = size.x;
        this.size.y = size.y;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Given the 3d positions for top-left and bottom-right, it recalculates
     * all the 2d values in client space.
     */
    proto.updateTransformMatrix = function () {

        var strokeWidth = this.style['stroke-width'];

        var originX = Math.max(this.size.x - strokeWidth, 0) * 0.5;
        var originY = Math.max(this.size.y - strokeWidth, 0) * 0.5;

        this.transformSvg = [
            'translate(', this.position.x, ',', this.position.y, ') ',
            'rotate(', namespaceUtils.radiansToDegrees(-this.rotation), ') ',
            'translate(', -originX, ',', -originY, ') '
        ].join('');
    };

    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function() {

        this.updateTransformMatrix();

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
        var strokeOpacity = this.style['stroke-opacity'];
        var fillColor = this.style['fill-color'];
        var fillOpacity = this.style['fill-opacity'];

        var rad_x = Math.max(this.size.x - strokeWidth, 0) * 0.5;
        var rad_y = Math.max(this.size.y - strokeWidth, 0) * 0.5;

        this.shape.setAttribute("transform", this.transformSvg);
        this.shape.setAttribute("stroke-width", strokeWidth);
        this.shape.setAttribute("stroke", namespaceUtils.composeRGBAString(strokeColor, strokeOpacity));
        this.shape.setAttribute('fill', namespaceUtils.composeRGBAString(fillColor, fillOpacity));
        this.shape.setAttribute('cx', rad_x);
        this.shape.setAttribute('cy', rad_y);
        this.shape.setAttribute('rx', rad_x);
        this.shape.setAttribute('ry', rad_y);
    };

    /**
     * Specifies the parent layer which will contain the markup.
     * @param {HTMLElement} parent
     */
    proto.setParent = function(parent) {

        var div = this.shape;
        div.parentNode && div.parentNode.removeChild(div);
        parent && parent.appendChild(div);
    };

    /**
     * Changes the rotation of the markup to the given angle.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetRotation edit action
     *
     * @param {Number} angle
     */
    proto.setRotation = function(angle) {

        this.rotation = angle;
        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Changes the position and size of the markup.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetSize edit action
     * @param {{x: Number, y: Number}} position
     * @param {Number} width
     * @param {Number} height
     */
    proto.setSize = function (position, width, height) {

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = width;
        this.size.y = height;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Used by the EditFrame to move the markup in Client Space coordinates
     * @param {Number} x - New X location for the markup. Notice that markups are centered on this value.
     * @param {Number} y - New Y location for the markup. Notice that markups are centered on this value.
     */
    proto.setPosition = function(x,y) {

        this.position.x = x;
        this.position.y = y;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Signals that the markup has been created
     */
    proto.created = function() {
        // Nothing //
    };

    proto.destroy = function() {

        this.unselect();
        this.setParent(null);
    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = "ellipse";
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.rotation = String(this.rotation);

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    /**
     *
     * @param ctx
     */
    proto.renderToCanvas = function(ctx) {

        // ellipse method is not supported by all browsers, took this implementation from
        // Stack Overflow: http://goo.gl/64esnm
        function ellipse(ctx, cx, cy, w, h) {

            ctx.beginPath();
            var lx = cx - w/2,
                rx = cx + w/2,
                ty = cy - h/2,
                by = cy + h/2;

            var magic = 0.551784;
            var xmagic = magic*w/2;
            var ymagic = magic*h/2;

            ctx.moveTo(cx,ty);
            ctx.bezierCurveTo(cx+xmagic,ty,rx,cy-ymagic,rx,cy);
            ctx.bezierCurveTo(rx,cy+ymagic,cx+xmagic,by,cx,by);
            ctx.bezierCurveTo(cx-xmagic,by,lx,cy+ymagic,lx,cy);
            ctx.bezierCurveTo(lx,cy-ymagic,cx-xmagic,ty,cx,ty);
            ctx.stroke();
        }

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.style['stroke-color'];
        var strokeOpacity = this.style['stroke-opacity'];
        var fillColor = this.style['fill-color'];
        var fillOpacity = this.style['fill-opacity'];

        var width = this.size.x - strokeWidth;
        var height = this.size.y - strokeWidth;
        var size = this.editor.sizeFromMarkupsToClient(width, height);
        var center = this.editor.positionFromMarkupsToClient(this.position.x, this.position.y);

        ctx.strokeStyle = namespaceUtils.composeRGBAString(strokeColor, strokeOpacity);
        ctx.fillStyle = namespaceUtils.composeRGBAString(fillColor, fillOpacity);
        ctx.lineWidth = this.editor.sizeFromMarkupsToClient(strokeWidth, 0).x;
        ctx.translate(center.x, center.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ellipse(ctx, 0, 0, size.x, size.y);
        fillOpacity !== 0 && ctx.fill();
        ctx.stroke();
    };

    namespace.MarkupCircle = MarkupCircle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param id
     * @param editor
     * @constructor
     */
    function MarkupCloud(id, editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.Markup.call(this, id, editor, styleAttributes);

        this.type = namespace.MARKUP_TYPE_CLOUD;
        this.lineJoint = 'round';

        this.createSVG();
        this.bindDomEvents();
    }

    MarkupCloud.prototype = Object.create(namespace.Markup.prototype);
    MarkupCloud.prototype.constructor = MarkupCloud;

    var proto = MarkupCloud.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeCloud(this.editor);
    };

    proto.createSVG = function() {
        this.shape = namespaceUtils.createSvgElement('path');
    };

    proto.bindDomEvents = function() {
        if (namespaceUtils.isTouchDevice()) {
            this.bindTouchEvents(this.shape);
        }
        this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true );
        this.shape.addEventListener("mouseout", function(){this.highlight(false);}.bind(this));
        this.shape.addEventListener("mouseover", function(){this.highlight(true);}.bind(this));
      };

    /**
     * Sets position and size in markup space coordinates.
     * @param {Object} position
     * @param {Object} size
     */
    proto.set = function(position, size) {

        this.rotation = 0; // Reset angle //

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = size.x;
        this.size.y = size.y;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Given the 3d positions for top-left and bottom-right, it recalculates
     * all the 2d values in client space.
     */
    proto.updateTransformMatrix = function () {

        var originX = (this.size.x) * 0.5;
        var originY = (this.size.y) * 0.5;

        this.transformSvg = [
            'translate(', this.position.x, ',', this.position.y, ') ',
            'rotate(', namespaceUtils.radiansToDegrees(-this.rotation), ') ',
            'translate(', -originX, ',', -originY, ') '
        ].join('');
    };

    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function() {

        this.updateTransformMatrix();

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
        var strokeOpacity = this.style['stroke-opacity'];
        var fillColor = this.style['fill-color'];
        var fillOpacity = this.style['fill-opacity'];

        this.shape.setAttribute("transform", this.transformSvg);
        this.shape.setAttribute("stroke-width", strokeWidth);
        this.shape.setAttribute("stroke", namespaceUtils.composeRGBAString(strokeColor, strokeOpacity));
        this.shape.setAttribute('fill', namespaceUtils.composeRGBAString(fillColor, fillOpacity));
        this.shape.setAttribute('stroke-linejoin', this.lineJoint);

        var pathMovements = this.getPathMovements();
        var mappedMovements = pathMovements.map(function(moves, index){
            if (index === 0) {
                //start
                //moves = [x, y]
                return ['M'].concat(moves.join(',')).join(' '); //M x,y
            } else {
                //curve
                //moves = [[x, y], [x, y], [x, y]]
                var bezier = moves.map(function(move){
                    return move.join(','); // "x,y"
                }); // ["x,y", "x,y", "x,y"]
                return ['C'].concat(bezier).join(' '); // "C x,y x,y x,y"
            }
        });
        mappedMovements.push('Z');
        this.shape.setAttribute('d', mappedMovements.join(' '));
    };

    /**
     * Helper function that creates intermediate points given the
     * current position and size.
     * @returns {Array}
     */
    proto.getPathMovements = function() {

        var strokeWidth = this.style['stroke-width'];

        var vWidth = this.size.x === 0 ? 1 : this.size.x;
        var vHeight = this.size.y === 0 ? 1 : this.size.y;

        var arcWidth = strokeWidth * 4;  // MarkupCloud coord space value
        var arcHeight = strokeWidth * 3; // MarkupCloud coord space value

        var offsetFromVertex = (arcHeight + (strokeWidth / 2));
        var cloudWidth = vWidth - (offsetFromVertex * 2); //remove 2x to account for the left and right offsets
        var cloudHeight = vHeight - (offsetFromVertex * 2); //remove 2x to account for the top and bottom offsets

        //determine how many arcs to draw horizontally
        var numOfHorizontalArcs = cloudWidth / arcWidth;
        //and vertically
        var numOfVerticalArcs = cloudHeight / arcWidth;

        //the # of arcs may be a decimal. In that case, draw a smaller arc to complete/fill the given width/height
        var partialHorizontalArc = numOfHorizontalArcs % 1; //get the decimal portion only
        var partialVerticalArc = numOfVerticalArcs % 1; ////get the decimal portion only

        //drop the decimal
        numOfHorizontalArcs = parseInt(numOfHorizontalArcs, 10);
        numOfVerticalArcs = parseInt(numOfVerticalArcs, 10);

        var currentX = offsetFromVertex,
            currentY = offsetFromVertex;

        function bezierCurve(width, height, side) {
            //left control point offset
            var lcpOffset = (width * 0.25);
            //right control point offset
            var rcpOffset = (width * 0.75);

            switch(side) {
                case "top":
                    return [
                        [currentX + lcpOffset, currentY - height],  //control point 1
                        [currentX + rcpOffset, currentY - height],  //control point 2
                        [currentX += width, currentY]               //end point
                    ];
                case "right":
                    return [
                        [currentX + height, currentY + lcpOffset],
                        [currentX + height, currentY + rcpOffset],
                        [currentX, currentY += width]
                    ];
                case "bottom":
                    return [
                        [currentX - lcpOffset, currentY + height],
                        [currentX - rcpOffset, currentY + height],
                        [currentX -= width, currentY]
                    ];
                case "left":
                    return [
                        [currentX - height, currentY - lcpOffset],
                        [currentX - height, currentY - rcpOffset],
                        [currentX, currentY -= width]
                    ];
            }
        }

        //create a movements array with the first movement
        var movements = [
            [currentX, currentY] //M
        ];

        //create the bezier curve for each side
        ['top', 'right', 'bottom', 'left'].forEach(function(side){
            var horizontal = isHorizontal(side);
            var numOfArcs = horizontal ? numOfHorizontalArcs : numOfVerticalArcs;
            var partialArc = horizontal ? partialHorizontalArc : partialVerticalArc;

            for (var i = 0; i < numOfArcs; i++) {
                movements.push(bezierCurve(arcWidth, arcHeight, side));
            }
            if (partialArc !== 0)
                movements.push(bezierCurve(partialArc * arcWidth, arcHeight, side));
        });

        return movements;
    };

    /**
     * Specifies the parent layer which will contain the markup.
     * @param {HTMLElement} parent
     */
    proto.setParent = function(parent) {

        var div = this.shape;
        div.parentNode && div.parentNode.removeChild(div);
        parent && parent.appendChild(div);
    };

    /**
     * Changes the rotation of the markup to the given angle.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetRotation edit action
     *
     * @param {Number} angle
     */
    proto.setRotation = function (angle) {

        this.rotation = angle;
        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Changes the position and size of the markup.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetSize edit action
     * @param {{x: Number, y: Number}} position
     * @param {Number} width
     * @param {Number} height
     */
    proto.setSize = function (position, width, height) {

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = width;
        this.size.y = height;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Used by the EditFrame to move the markup in Client Space coordinates
     * @param {Number} x - New X location for the markup. Notice that markups are centered on this value.
     * @param {Number} y - New Y location for the markup. Notice that markups are centered on this value.
     */
    proto.setPosition = function(x,y) {

        this.position.x = x;
        this.position.y = y;
        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Signals that the markup has been created
     */
    proto.created = function() {

    };

    proto.destroy = function() {

        this.unselect();
        this.setParent(null);
    };

    /**
     *
     * @param bounds
     */
    proto.constrainsToBounds = function(bounds) {
    };

    function isHorizontal(side) {

        return side === 'top' || side === 'bottom';
    }

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = "cloud";
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.rotation = String(this.rotation);

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    /**
     * Renders the Markup onto an HTML-5 canvas surface.
     * @param {Object} ctx - Canvas rendering context
     */
    proto.renderToCanvas = function(ctx) {

        var m1 = new THREE.Matrix4().makeTranslation(-this.size.x * 0.5, -this.size.y * 0.5, 0);
        var m2 = new THREE.Matrix4().makeRotationZ(-this.rotation);
        var m3 = new THREE.Matrix4().makeTranslation(this.position.x, this.position.y, 0);
        var transform = m3.multiply(m2).multiply(m1);

        var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
        var strokeOpacity = this.style['stroke-opacity'];
        var fillColor = this.style['fill-color'];
        var fillOpacity = this.style['fill-opacity'];

        ctx.strokeStyle = namespaceUtils.composeRGBAString(strokeColor, strokeOpacity);
        ctx.fillStyle = namespaceUtils.composeRGBAString(fillColor, fillOpacity);
        ctx.lineJoin = this.lineJoint;
        ctx.lineWidth = this.editor.sizeFromMarkupsToClient(this.style['stroke-width'], 0).x;
        ctx.beginPath();

        var vector3 = new THREE.Vector3();
        var mappingFn = this.editor.positionFromMarkupsToClient.bind(this.editor);
        var pathMovements = this.getPathMovements();
        pathMovements.forEach(function(moves, index){
            if (index === 0) {
                //start or svg M
                //moves = [x, y]
                vector3.x = moves[0];
                vector3.y = moves[1];
                vector3.z = 0;
                vector3 = vector3.applyMatrix4(transform);
                var pos = mappingFn(vector3.x, vector3.y);
                ctx.moveTo(pos.x, pos.y);
            } else {
                //curve or svg C
                //moves = [[x, y], [x, y], [x, y]]
                vector3.x = moves[0][0];
                vector3.y = moves[0][1];
                vector3.z = 0;
                vector3 = vector3.applyMatrix4(transform);
                var cp1 = mappingFn(vector3.x, vector3.y);

                vector3.x = moves[1][0];
                vector3.y = moves[1][1];
                vector3.z = 0;
                vector3 = vector3.applyMatrix4(transform);
                var cp2 = mappingFn(vector3.x, vector3.y);

                vector3.x = moves[2][0];
                vector3.y = moves[2][1];
                vector3.z = 0;
                vector3 = vector3.applyMatrix4(transform);
                var end = mappingFn(vector3.x, vector3.y);

                ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
            }
        });
        ctx.closePath();
        fillOpacity !== 0 && ctx.fill();
        ctx.stroke();
    };

    namespace.MarkupCloud = MarkupCloud;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param id
     * @param editor
     * @constructor
     */
    function MarkupFreehand(id, editor) {

        var styleAttributes = ['stroke-width', 'stroke-color','stroke-opacity'];
        namespace.Markup.call(this, id, editor, styleAttributes);

        this.type = namespace.MARKUP_TYPE_FREEHAND;

        // Position represents top-left (instead of center as in most other markups).
        this.iniSize = {x: 1, y: 1};

        this.createSVG();
        this.bindDomEvents();
    }

    MarkupFreehand.prototype = Object.create(namespace.Markup.prototype);
    MarkupFreehand.prototype.constructor = MarkupFreehand;

    var proto = MarkupFreehand.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeFreehand(this.editor);
    };

    proto.createSVG = function() {
        this.shape = namespaceUtils.createSvgElement('path');
    };

    proto.bindDomEvents = function() {
        if (namespaceUtils.isTouchDevice()) {
            this.bindTouchEvents(this.shape);
        }
        this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
        this.shape.addEventListener("mouseout", function(){ this.highlight(false); }.bind(this));
        this.shape.addEventListener("mouseover", function(){ this.highlight(true); }.bind(this));
    };

    /**
     * Sets top-left and bottom-right values in client space coordinates (2d).
     *
     * @param position
     * @param size
     * @param locations
     */
    proto.set = function(position, size, locations) {

        this.rotation = 0; // Reset angle //

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = size.x;
        this.size.y = size.y;
        this.locations = locations.concat();

        this.iniSize.x = (size.x === 0) ? 1 : size.x;
        this.iniSize.y = (size.y === 0) ? 1 : size.y;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Given the 3d positions for top-left and bottom-right, it recalculates
     * all the 2d values in client space.
     */
    proto.updateTransformMatrix = function () {

        var scaleX = this.size.x / this.iniSize.x;
        var scaleY = this.size.y / this.iniSize.y;

        this.transformSvg = [
            'translate(', this.position.x, ',', this.position.y, ') ',
            'rotate(', namespaceUtils.radiansToDegrees(-this.rotation), ') ',
            'scale(', scaleX, ',', scaleY, ') '
        ].join('');
    };

    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function() {

        this.updateTransformMatrix();

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
        var strokeOpacity = this.style['stroke-opacity'];

        this.shape.setAttribute("transform", this.transformSvg);
        this.shape.setAttribute("stroke-width", strokeWidth);
        this.shape.setAttribute("stroke", namespaceUtils.composeRGBAString(strokeColor, strokeOpacity));
        this.shape.setAttribute('fill', 'none');
        this.shape.setAttribute('opacity', namespaceUtils.composeRGBAString(strokeColor, strokeOpacity));

        var pathData = this.locations.map(function(point, i){
            if (i === 0) {
                return ['M'].concat([point.x, point.y]).join(' ');
            } else {
                return ['L'].concat([point.x, point.y]).join(' ');
            }
        }).join(' ');
        this.shape.setAttribute('d', pathData);
    };

    /**
     * Specifies the parent layer which will contain the markup.
     * @param {HTMLElement} parent
     */
    proto.setParent = function(parent) {

        var div = this.shape;
        div.parentNode && div.parentNode.removeChild(div);
        parent && parent.appendChild(div);
    };

    /**
     * Changes the rotation of the markup to the given angle.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetRotation edit action
     *
     * @param {Number} angle
     */
    proto.setRotation = function (angle) {

        this.rotation = angle;
        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Changes the position and size of the markup.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetSize edit action
     * @param {{x: Number, y: Number}} position
     * @param {Number} width
     * @param {Number} height
     */
    proto.setSize = function (position, width, height) {

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = width;
        this.size.y = height;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Used by the EditFrame to move the markup in Client Space coordinates
     * @param {Number} x - New X location for the markup. Notice that markups are centered on this value.
     * @param {Number} y - New Y location for the markup. Notice that markups are centered on this value.
     */
    proto.setPosition = function(x,y) {

        this.position.x = x;
        this.position.y = y;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Signals that the markup has been created
     */
    proto.created = function() {
        // Nothing //
    };

    proto.destroy = function() {

        this.unselect();
        this.setParent(null);
    };

    /**
     *
     * @param bounds
     */
    proto.constrainsToBounds = function(bounds) {

    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = "freehand";
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.rotation = String(this.rotation);
        metadata.locations = this.locations.map(function(point){
            return [point.x, point.y].join(" ");
        }).join(" ");

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    proto.renderToCanvas = function(ctx) {

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.style['stroke-color'];
        var strokeOpacity = this.style['stroke-opacity'];

        var scaleX = this.size.x / this.iniSize.x;
        var scaleY = this.size.y / this.iniSize.y;
        var m0 = new THREE.Matrix4().makeScale(scaleX, scaleY, 1);
        var m1 = new THREE.Matrix4().makeRotationZ(-this.rotation);
        var m2 = new THREE.Matrix4().makeTranslation(this.position.x, this.position.y, 0);
        var transform = m2.multiply(m1).multiply(m0);

        ctx.strokeStyle = namespaceUtils.composeRGBAString(strokeColor, strokeOpacity);
        ctx.lineWidth = this.editor.sizeFromMarkupsToClient(strokeWidth, 0).x;
        ctx.beginPath();

        var that = this;
        var vector3 = new THREE.Vector3();
        this.locations.forEach(function(point, i){
            vector3.x = point.x;
            vector3.y = point.y;
            vector3.z = 0;
            vector3 = vector3.applyMatrix4(transform);
            point = that.editor.positionFromMarkupsToClient(vector3.x, vector3.y);
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
    };

    namespace.MarkupFreehand = MarkupFreehand;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * @class
     * Implements a Rectangle [Markup]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup}.
     * Included in documentation as an example of how to create
     * a specific markup type. Developers are encourage to look into this class's source code and copy
     * as much code as they need. Find link to source code below.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     * @extends Autodesk.Viewing.Extensions.Markups.Core.Markup
     *
     * @param {number} id
     * @param {Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore} editor
     * @constructor
     */
    function MarkupRectangle(id, editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.Markup.call(this, id, editor, styleAttributes);

        this.type = namespace.MARKUP_TYPE_RECTANGLE;

        this.createSVG();
        this.bindDomEvents();
    }

    MarkupRectangle.prototype = Object.create(namespace.Markup.prototype);
    MarkupRectangle.prototype.constructor = MarkupRectangle;

    var proto = MarkupRectangle.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeRectangle(this.editor);
    };

    proto.createSVG = function() {
        this.shape = namespaceUtils.createSvgElement('rect');
    };

    proto.bindDomEvents = function() {
        if (namespaceUtils.isTouchDevice()) {
            this.bindTouchEvents(this.shape);
        }
        this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true );
        this.shape.addEventListener("mouseout", function(){this.highlight(false);}.bind(this));
        this.shape.addEventListener("mouseover", function(){this.highlight(true);}.bind(this));
    };

    /**
     * Sets position and size in markup space coordinates
     * @param {Object} position
     * @param {Object} size
     */
    proto.set = function(position, size) {

        this.rotation = 0; // Reset angle //

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = size.x;
        this.size.y = size.y;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Given the 3d positions for top-left and bottom-right, it recalculates
     * all the 2d values in client space.
     */
    proto.updateTransformMatrix = function() {

        var strokeWidth = this.style['stroke-width'];

        var originX = Math.max(this.size.x - strokeWidth, 0) * 0.5;
        var originY = Math.max(this.size.y - strokeWidth, 0) * 0.5;

        this.transformSvg = [
            'translate(', this.position.x, ',', this.position.y, ') ',
            'rotate(', namespaceUtils.radiansToDegrees(-this.rotation), ') ',
            'translate(', -originX, ',', -originY, ') '
        ].join('');
    };

    /**
     * Applies data values into DOM element style/attribute(s)
     *
     */
    proto.updateStyle = function() {

        this.updateTransformMatrix();

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
        var strokeOpacity = this.style['stroke-opacity'];
        var fillColor = this.style['fill-color'];
        var fillOpacity = this.style['fill-opacity'];

        this.shape.setAttribute("transform", this.transformSvg);
        this.shape.setAttribute("stroke-width",  strokeWidth);
        this.shape.setAttribute("stroke", namespaceUtils.composeRGBAString(strokeColor, strokeOpacity));
        this.shape.setAttribute('fill', namespaceUtils.composeRGBAString(fillColor, fillOpacity));
        this.shape.setAttribute('width', Math.max(this.size.x - strokeWidth, 0));
        this.shape.setAttribute('height', Math.max(this.size.y - strokeWidth, 0));
    };

    /**
     * Specifies the parent layer which will contain the markup.
     * @param {HTMLElement} parent
     */
    proto.setParent = function(parent) {

        var div = this.shape;
        div.parentNode && div.parentNode.removeChild(div);
        parent && parent.appendChild(div);
    };

    /**
     * Changes the rotation of the markup to the given angle.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetRotation edit action
     *
     * @param {Number} angle
     */
    proto.setRotation = function(angle) {

        this.rotation = angle;
        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Changes the position and size of the markup.
     * This gets called by the Autodesk.Viewing.Extensions.Markups.Core.SetSize edit action
     * @param {{x: Number, y: Number}} position
     * @param {Number} width
     * @param {Number} height
     */
    proto.setSize = function(position, width, height) {

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = width;
        this.size.y = height;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Used by the EditFrame to move the markup in Client Space coordinates
     * @param {Number} x - New X location for the markup. Notice that markups are centered on this value.
     * @param {Number} y - New Y location for the markup. Notice that markups are centered on this value.
     */
    proto.setPosition = function(x,y) {

        this.position.x = x;
        this.position.y = y;
        this.updateTransformMatrix();
        this.updateStyle();
    };

    /**
     * Signals that the markup has been created
     */
    proto.created = function() {

    };

    proto.destroy = function() {

        this.unselect();
        this.setParent(null);
    };

    /**
     *
     * @param bounds
     */
    proto.constrainsToBounds = function(bounds) {

    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = "rectangle";
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.rotation = String(this.rotation);

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    proto.renderToCanvas = function(ctx) {

        var strokeWidth = this.style['stroke-width'];
        var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
        var strokeOpacity = this.style['stroke-opacity'];
        var fillColor = this.style['fill-color'];
        var fillOpacity = this.style['fill-opacity'];

        var width = this.size.x - strokeWidth;
        var height = this.size.y - strokeWidth;
        var size = this.editor.sizeFromMarkupsToClient(width, height);
        var clientWidth = size.x;
        var clientHeight = size.y;
        var clientCenter = this.editor.positionFromMarkupsToClient(this.position.x, this.position.y);

        ctx.strokeStyle = namespaceUtils.composeRGBAString(strokeColor, strokeOpacity);
        ctx.fillStyle = namespaceUtils.composeRGBAString(fillColor, fillOpacity);
        ctx.lineWidth = this.editor.sizeFromMarkupsToClient(strokeWidth, 0).x;
        ctx.translate(clientCenter.x, clientCenter.y);
        ctx.rotate(this.getRotation());
        fillOpacity !== 0 && ctx.fillRect(clientWidth / -2, clientHeight / -2, clientWidth, clientHeight);
        ctx.strokeRect(clientWidth / -2, clientHeight / -2, clientWidth, clientHeight);
    };

    namespace.MarkupRectangle = MarkupRectangle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * Arrow Markup.
     * @constructor
     */
    function MarkupText(id, editor, size) {

        var styleAttributes = [
            'font-size',
            'stroke-color', 'stroke-opacity',
            'fill-color', 'fill-opacity',
            'font-family',
            'font-style',
            'font-weight'
        ];
        namespace.Markup.call(this, id, editor, styleAttributes);
        this.constraintRotation = true;

        this.type = namespace.MARKUP_TYPE_TEXT;

        this.size.x = size.x;
        this.size.y = size.y;
        this.currentText = "";
        this.currentTextLines = [""];
        this.textDirty = true;

        // Note: We could have this property be a style property.
        // However, there is no need for this property to be exposed to the user for alteration
        // This value is a percentage of the font size used to offset vertically 2 text lines
        // of the same paragraph.
        // Notice that this value is used by EditorTextInput.js
        this.lineHeight = 130;

        this.createSvg();
        this.bindDomEvents();
    }

    MarkupText.prototype = Object.create(namespace.Markup.prototype);
    MarkupText.prototype.constructor = MarkupText;

    var proto = MarkupText.prototype;

    proto.getEditMode = function() {

        return new namespace.EditModeText(this.editor);
    };

    proto.createSvg = function() {

        // Used to clip rendering of text.
        // We are particularly interested in vertical clipping
        this.clipPath = namespaceUtils.createSvgElement('clipPath');
        this.clipPathId = 'CO2_Markup_clip_' + this.id;
        this.clipPath.setAttribute('id', this.clipPathId);
        this.clipPath.removeAttribute('pointer-events');

        // The actual clipping shape
        this.clipRect = namespaceUtils.createSvgElement('rect');
        this.clipRect.removeAttribute('pointer-events');
        this.clipPath.appendChild(this.clipRect); // Add to clipPath

        this.shape = namespaceUtils.createSvgElement('text');
        this.shapeBg = namespaceUtils.createSvgElement('rect');
    };

    proto.bindDomEvents = function() {
        if (namespaceUtils.isTouchDevice()) {
            this.bindTouchEvents(this.shape);
        }
        this.shape.addEventListener("mousedown", this.onMouseDown.bind(this), true);
        this.shape.addEventListener("mouseout", function(){this.highlight(false);}.bind(this));
        this.shape.addEventListener("mouseover", function(){this.highlight(true);}.bind(this));
    };

    /**
     *
     * @param {String} position
     * @param {String} size
     * @param {String} textString
     * @param {Array} textLines
     */
    proto.set = function(position, size, textString, textLines) {

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = size.x;
        this.size.y = size.y;

        this.updateTransformMatrix();
        this.updateStyle();
        this.setText(textString, textLines);
    };

    proto.updateTransformMatrix = function() {

        var ox = this.size.x * 0.5;
        var oy = this.size.y * 0.5;
        var pos_x = this.position.x - ox;
        var pos_y = this.position.y - oy;

        this.transformSvg = [
            'translate(', pos_x, ',', pos_y, ') ',
            'scale(', 1, ',', -1, ') '].join('');
    };

    proto.setPosition = function(x, y) {

        this.position.x = x;
        this.position.y = y;

        this.updateTransformMatrix();
        this.updateStyle();
    };

    proto.setSize = function(position, width, height) {

        var recalcLines = (this.size.x !== width);

        this.position.x = position.x;
        this.position.y = position.y;
        this.size.x = width;
        this.size.y = height;

        if (recalcLines) {
            var newLines = this.calcTextLines();
            if (!this.linesAreEqual(newLines)) {
                this.currentTextLines = newLines;
                this.textDirty = true;
                this.forceRedraw();
            }
        }

        this.updateTransformMatrix();
        this.updateStyle();
    };

    proto.calcTextLines = function() {
        // TODO: This is ugly as hell. We need a better approach to this.
        return this.editor.editMode.textInputHelper.getTextValuesForMarkup(this).lines;
    };

    proto.setStyle = function(style) {
        namespaceUtils.copyStyle(style, this.style);
        this.updateStyle(true); // For Text Markup we always force a re-render of text
    };

    /**
     *
     * @param {Array} lines - Array of strings
     * @private
     */
    proto.linesAreEqual = function(lines) {
        var curr = this.currentTextLines;
        if (lines.length !== curr.length)
            return false;

        var len = curr.length;
        for (var i=0; i<len; ++i) {
            if (lines[i] !== curr[i])
                return false;
        }

        return true;
    };

    /**
     * Specifies the parent layer which will contain the markup.
     * @param {HTMLElement} parent
     */
    proto.setParent = function(parent) {

        // NOTE: Do not add clipPath into a <def> node.
        // Reason: It doesn't work in Chrome (Firefox did work).
        var currentParent = this.clipPath.parentNode;
        currentParent && currentParent.removeChild(this.clipPath);
        parent && parent.appendChild(this.clipPath);

        currentParent = this.shapeBg.parentNode;
        currentParent && currentParent.removeChild(this.shapeBg);
        parent && parent.appendChild(this.shapeBg);

        currentParent = this.shape.parentNode;
        currentParent && currentParent.removeChild(this.shape);
        parent && parent.appendChild(this.shape);
    };

    /**
     *
     * @param {String} text
     */
    proto.setText = function(text) {

        this.currentText = text;
        this.currentTextLines = this.calcTextLines();
        this.textDirty = true;
        this.updateStyle();
    };

    /**
     * Returns the raw string value
     * @returns {String}
     */
    proto.getText = function() {

        return this.currentText;
    };

    /**
     * Returns a shallow copy of the text lines used for rendering SVG text
     * @returns {Array.<String>}
     */
    proto.getTextLines = function() {

        return this.currentTextLines.concat();
    };

    /**
     * Applies data values into DOM element style/attribute(s)
     *
     * @param {Boolean} [forceDirty] - Whether we want to re-render the text
     */
    proto.updateStyle = function(forceDirty) {

        this.updateTransformMatrix();

        var fontSize = this.style['font-size'];
        var strokeColor = this.highlighted ? this.highlightColor : this.style['stroke-color'];
        var strokeOpacity = this.style['stroke-opacity'];

        // See standard: http://www.w3.org/TR/SVG/fonts.html
        this.shape.setAttribute("font-family", this.style['font-family']);
        this.shape.setAttribute("font-size", fontSize);
        this.shape.setAttribute('font-weight', this.style['font-weight'] ? 'bold' : '');
        this.shape.setAttribute("font-style", this.style['font-style'] ? 'italic' : '');
        this.shape.setAttribute("fill", namespaceUtils.composeRGBAString(strokeColor, strokeOpacity));

        // SVG text (as opposed to DIV text) is rendered "on top" of the indicated Y position.
        // Thus, we need to offset it down a bit, and for that we need to take care into account
        // the text bounding box's height (and maybe its y coordinate).
        var bbox = this.shape.getBBox(); // Assumes font style is already in place.
        var verticalTransform = ['translate(0, ', -this.size.y + fontSize, ')'].join('');
        this.shape.setAttribute("transform", this.transformSvg + verticalTransform);
        this.shape.setAttribute('clip-path', 'url(#' + this.clipPathId + ')');

        // Must be called AFTER shape's styles are in place.
        if (this.textDirty || forceDirty) {
            if (forceDirty) {
                this.currentTextLines = this.calcTextLines();
            }
            this.rebuildTextSvg();
            this.textDirty = false;
        }

        // Update clipping rect
        this.clipRect.setAttribute('x', "0");
        this.clipRect.setAttribute('y', bbox.y); // Negative number
        this.clipRect.setAttribute('width', this.size.x);
        this.clipRect.setAttribute('height', this.size.y);

        // Update visible background rectangle
        var fillColor = this.style['fill-color'];
        var fillOpacity = this.style['fill-opacity'];
        verticalTransform = ['translate(0, ', -this.size.y, ')'].join('');
        this.shapeBg.setAttribute("transform", this.transformSvg + verticalTransform);
        this.shapeBg.setAttribute('width', this.size.x);
        this.shapeBg.setAttribute('height', this.size.y);
        this.shapeBg.setAttribute("stroke-width",  '0');
        this.shapeBg.setAttribute('fill', namespaceUtils.composeRGBAString(fillColor, fillOpacity));
    };

    /**
     * Re-creates SVG tags that render SVG text.
     * Each line is placed around tspan tags which are vertically offset to each other.
     */
    proto.rebuildTextSvg = function() {

        // Begin by removing all children (if any).
        while (this.shape.childNodes.length > 0) {
            this.shape.removeChild(this.shape.childNodes[0]);
        }

        // For each line, create a tspan, add as child and offset it vertically.
        var dx = 0;
        var dy = 0;
        var yOffset = this.getLineHeight();
        this.currentTextLines.forEach(function(line){
            var tspan = namespaceUtils.createSvgElement('tspan');
            tspan.setAttribute('x', dx);
            tspan.setAttribute('y', dy);
            tspan.textContent = line;
            this.shape.appendChild(tspan);
            dy += yOffset;
        }.bind(this));
    };

    proto.setMetadata = function() {

        var metadata = namespaceUtils.cloneStyle(this.style);

        metadata.type = "label";
        metadata.position = [this.position.x, this.position.y].join(" ");
        metadata.size = [this.size.x, this.size.y].join(" ");
        metadata.text = String(this.currentText);

        return namespaceUtils.addMarkupMetadata(this.shape, metadata);
    };

    /**
     * Helper method that returns the font size in client space coords.
     * @returns {Number}
     */
    proto.getClientFontSize = function() {

        return this.editor.sizeFromMarkupsToClient(0, this.style['font-size']).y;
    };

    proto.getLineHeight = function() {
        return this.style['font-size'] * (this.lineHeight * 0.01);
    };

    proto.forceRedraw = function() {

        // In chrome the text is not rendered until its style changes after creation.
        // With this hack the text is drawn correctly.
        window.requestAnimationFrame(function() {
            this.highlighted = !this.highlighted;
            this.updateStyle();
            this.highlighted = !this.highlighted;
            this.updateStyle();
        }.bind(this));
    };

    /**
     * Renders the lines of text to the canvas.
     * This method does not attempt to figure out how to wrap text. Instead, it expects
     * a set of lines that are already adjusted to fit in the given space.
     * All this does it renders them in the correct vertical position
     *
     * @param {CanvasRenderingContext2D} ctx - the canvas context to draw on
     * @param {String[]} lines - the lines of text to render already adjusted to wrap properly
     * @param {Number} lineHeight - the height of each line
     * @param {Number} maxHeight - maximum height the text will render to
     */
    function renderLinesOfText(ctx, lines, lineHeight, maxHeight){

        var y = 0;//only the vertical position changes
        lines.forEach(function(line){
            //check if we're over the max height allowed
            //if so, just end
            if ((y + lineHeight) > maxHeight) {
                return;
            }
            ctx.fillText(line, 0, y);
            y += lineHeight;
        });
    }

    proto.renderToCanvas = function(ctx) {

        var fontFamily = this.style['font-family'];
        var fontStyle = this.style['font-style'] ? "italic" : "";
        var fontWeight = this.style['font-weight'] ? "bold" : "";
        var strokeColor = this.style['stroke-color'];
        var fontOpacity = this.style['stroke-opacity'];
        var fontSize = this.getClientFontSize();
        var lineHeight = fontSize * (this.lineHeight * 0.01);

        //var rotation = this.getRotation(); TODO: Revisit rotation when it becomes available
        var center = this.editor.positionFromMarkupsToClient(this.position.x, this.position.y);
        var clientSize = this.editor.sizeFromMarkupsToClient(this.size.x, this.size.y);

        // Background rect
        ctx.save();
        {
            var fillColor = this.style['fill-color'];
            var fillOpacity = this.style['fill-opacity'];
            ctx.fillStyle = namespaceUtils.composeRGBAString(fillColor, fillOpacity);
            ctx.translate(center.x, center.y);
            //ctx.rotate(rotation);
            fillOpacity !== 0 && ctx.fillRect(clientSize.x * -0.5, clientSize.y * -0.5, clientSize.x, clientSize.y);
        }
        ctx.restore();

        // Text
        ctx.fillStyle = strokeColor;
        ctx.strokeStyle = strokeColor;
        ctx.textBaseline = 'top';
        ctx.translate(center.x - (clientSize.x * 0.5), center.y - (clientSize.y * 0.5));
        //ctx.rotate(rotation);
        ctx.font = fontStyle + " " + fontWeight + " " + fontSize + "px " + fontFamily;
        ctx.globalAlpha = fontOpacity;
        renderLinesOfText(ctx, this.currentTextLines, lineHeight, clientSize.y);
    };

    namespace.MarkupText = MarkupText;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    function MarkupTool() {

        Autodesk.Viewing.ToolInterface.call(this);
        this.names = ["markups.core"];
        this.panTool = null;
        this.allowNav = false;

        this.coreExt = null;
        this.hotkeysEnabled = true;

        var _ctrlDown = false;
        var _shiftDown = false;

        // Non-ToolInterface methods //

        this.allowNavigation = function(allow) {
            this.allowNav = allow;
        };
        this.setCoreExtension = function(coreExt) {
            this.coreExt = coreExt;
        };
        this.setHotkeysEnabled = function(enabled) {
            this.hotkeysEnabled = enabled;
        };


        // ToolInterface methods //

        this.activate = function(name, viewerApi) {
            this.panTool = viewerApi.toolController.getTool("pan");
            if (this.panTool) {
                this.panTool.activate("pan"); // TODO: What if we want "zoom" here?
            }
        };
        this.deactivate = function(name) {
            if (this.panTool) {
                this.panTool.deactivate("pan");
            }
            this.panTool = null;
        };

        this.handleKeyDown = function(event, keyCode) {

            if (!this.hotkeysEnabled) {
                return true; // Consume event
            }

            // Don't propagate key handling down to tool //

            switch (keyCode) {
                case Autodesk.Viewing.KeyCode.CONTROL: _ctrlDown = true; break;
                case Autodesk.Viewing.KeyCode.SHIFT: _shiftDown = true; break;

                case Autodesk.Viewing.KeyCode.x: _ctrlDown && !this.allowNav && this.coreExt.cut(); break;
                case Autodesk.Viewing.KeyCode.c: _ctrlDown && !this.allowNav && this.coreExt.copy(); break;
                case Autodesk.Viewing.KeyCode.v: _ctrlDown && !this.allowNav && this.coreExt.paste(); break;
                case Autodesk.Viewing.KeyCode.d:
                    if (_ctrlDown && !this.allowNav) {
                        // Duplicate
                        this.coreExt.copy();
                        this.coreExt.paste();
                    }
                    break;
                case Autodesk.Viewing.KeyCode.z:
                    if (_ctrlDown && !_shiftDown && !this.allowNav) {
                        this.coreExt.undo();
                    }
                    else if (_ctrlDown && _shiftDown && !this.allowNav) {
                        this.coreExt.redo(); // Also support Ctrl+Y
                    }
                    break;
                case Autodesk.Viewing.KeyCode.y: _ctrlDown && !this.allowNav && this.coreExt.redo(); break; // Also support ctrl+shift+z
                case Autodesk.Viewing.KeyCode.ESCAPE: this.coreExt.selectMarkup(null); break;
                default: break;
            }

            return true; // Consume event
        };
        this.handleKeyUp = function(event, keyCode) {

            if (!this.hotkeysEnabled) {
                return true; // Consume event
            }

            // Don't propagate key handling down to tool

            switch (keyCode) {
                case Autodesk.Viewing.KeyCode.CONTROL: _ctrlDown = false; break;
                case Autodesk.Viewing.KeyCode.SHIFT: _shiftDown = false; break;
                default: break;
            }

            return true; // Consume event ONLY
        };

        this.update = function() {
            if (this.allowNav && this.panTool && this.panTool.update) {
                return this.panTool.update();
            }
            return false;
        };

        this.handleSingleClick = function( event, button ) {
            if (this.allowNav && this.panTool && this.panTool.handleSingleClick) {
                return this.panTool.handleSingleClick(event, button);
            }
            return true; // Consume event
        };
        this.handleDoubleClick = function( event, button ) {
            if (this.allowNav && this.panTool && this.panTool.handleDoubleClick) {
                return this.panTool.handleDoubleClick(event, button);
            }
            return true; // Consume event
        };
        this.handleSingleTap = function( event ) {
            if (this.allowNav && this.panTool && this.panTool.handleSingleTap) {
                return this.panTool.handleSingleTap(event);
            }
            return true; // Consume event
        };
        this.handleDoubleTap = function( event ) {
            if (this.allowNav && this.panTool && this.panTool.handleDoubleTap) {
                return this.panTool.handleDoubleTap(event);
            }
            return true; // Consume event
        };
        this.handleWheelInput = function(delta) {
            if (this.allowNav && this.panTool && this.panTool.handleWheelInput) {
                return this.panTool.handleWheelInput(delta);
            }
            return true; // Consume event
        };
        this.handleButtonDown = function(event, button) {
            if (this.allowNav && this.panTool && this.panTool.handleButtonDown) {
                return this.panTool.handleButtonDown(event, button);
            }
            return true; // Consume event
        };
        this.handleButtonUp = function(event, button) {
            if (this.allowNav && this.panTool && this.panTool.handleButtonUp) {
                return this.panTool.handleButtonUp(event, button);
            }
            return true; // Consume event
        };
        this.handleMouseMove = function(event) {
            if (this.allowNav && this.panTool && this.panTool.handleMouseMove) {
                return this.panTool.handleMouseMove(event);
            }
            return true; // Consume event
        };
        this.handleGesture = function(event) {
            if (this.allowNav && this.panTool && this.panTool.handleGesture) {
                return this.panTool.handleGesture(event);
            }
            return true; // Consume event
        };
        this.handleBlur = function(event) {
            if (this.allowNav && this.panTool && this.panTool.handleBlur) {
                return this.panTool.handleBlur(event);
            }
            return true; // Consume event
        };
    }

    namespace.MarkupTool = MarkupTool;
})();

(function(){ 'use strict';

    var namespace = AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core');
    var namespaceUtils = AutodeskNamespace('Autodesk.Viewing.Extensions.Markups.Core.Utils');

    /**
     * @class
     * Extension used to overlay 2d markups over 2d and 3d models.
     *
     * @tutorial feature_markup
     * @param {Autodesk.Viewing.Viewer3D} viewer - Viewer instance used to operate on.
     * @param {Object} options - Same Dictionary object passed into [Viewer3D]{@link Autodesk.Viewing.Viewer3D}'s constructor.
     * @param {Boolean} [options.markupBypassOrthoCam] - Whether orthographic camera is forced onto 3d models when calling
     * [show()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#show}.
     * @param {Boolean} [options.markupDisableHotkeys] - Disables hotkeys for copy, cut, paste, duplicate, undo, redo and deselect.
     * @param {Autodesk.Viewing.ToolInterface} [options.markupToolClass] - Class override for input handling.
     * Use it to override/extend default hotkeys and/or mouse/gesture input.
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     * @constructor
     */
    function MarkupsCore(viewer, options) {

        Autodesk.Viewing.Extension.call(this, viewer, options);

        this.options = this.options || {};
        this.markups = [];
        this.styles = {};

        this.duringViewMode = false;
        this.duringEditMode = false;

        // Add action manager.
        this.actionManager = new namespace.EditActionManager( 50 ); // history of 50 actions.
        this.actionManager.addEventListener(namespace.EVENT_HISTORY_CHANGED, this.onEditActionHistoryChanged.bind(this));

        this.nextId = 0; // Used to identify markups by id during an edit session.

        // Clipboard.
        this.clipboard = new namespace.Clipboard(this);

        // Default Input handler.
        this.input = new namespace.InputHandler();

        // Extension will dispatch events.
        namespaceUtils.addTraitEventDispatcher(this);

        // Handled events.
        this.onCameraChangeBinded = this.onCameraChange.bind(this);
        this.onViewerResizeBinded = function(event) {
            // This is ugly, but we need to do this twice
            var self = this;
            // First usage is to avoid a blinking scenario
            self.onViewerResize(event);
            requestAnimationFrame(function(){
                // Second one is to actually make it work on some resize scenarios.
                // Check the unlikely scenario that we are no longer in view mode.
                if (self.duringViewMode) {
                    self.onViewerResize(event);
                }
            });
        }.bind(this);
        this.onMarkupDraggingBinded = this.onMarkupDragging.bind(this);
        this.onMarkupSelectedBinded = this.onMarkupSelected.bind(this);
        this.onMarkupEnterEditionBinded = this.onMarkupEnterEdition.bind(this);
        this.onMarkupCancelEditionBinded = this.onMarkupCancelEdition.bind(this);
        this.onMarkupDeleteEditionBinded = this.onMarkupDeleteEdition.bind(this);
    }

    MarkupsCore.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
    MarkupsCore.prototype.constructor = MarkupsCore;
    namespace.MarkupsCore = MarkupsCore;

    /*
     * Event types
     */
    namespace.EVENT_ENTER_EDIT_MODE = "EVENT_MARKUP_CORE_ENTER_EDIT_MODE";
    namespace.EVENT_LEAVE_EDIT_MODE = "EVENT_MARKUP_CORE_LEAVE_EDIT_MODE";
    namespace.EVENT_SELECTION_CHANGED = "EVENT_MARKUP_SELECTION_CHANGED";

    var proto = MarkupsCore.prototype;

    proto.load = function () {

        // Add layer where annotations will actually live
        var svg = this.svg = namespaceUtils.createSvgElement('svg');
        namespaceUtils.setSvgParentAttributes(svg);

        // NOTE: Required since LMV renders Y coordinates upwards,
        // while browser's Y coordinates goes downwards.
        var svgStyle = new namespaceUtils.DomElementStyle();
        svgStyle.setAttribute('position', 'absolute');
        svgStyle.setAttribute('left', '0');
        svgStyle.setAttribute('top', '0');
        svgStyle.setAttribute('transform', 'scale(1,-1)', { allBrowsers: true});
        svgStyle.setAttribute('transformOrigin', '0, 0', { allBrowsers: true});
        svgStyle.setAttribute('cursor', 'default');
        svg.setAttribute('style', svgStyle.getStyleString());

        this.bounds = {x:0, y:0, width:0, height:0};

        this.input.attachTo(this);

        //Instantiate edit frame.
        this.editFrame = new namespace.EditFrame(this.viewer.container, this);
        this.editFrame.addEventListener(namespace.EVENT_EDITFRAME_EDITION_START, function(){this.disableMarkupInteractions(true);}.bind(this));
        this.editFrame.addEventListener(namespace.EVENT_EDITFRAME_EDITION_END, function(){this.disableMarkupInteractions(false);}.bind(this));

        // Register tool
        var toolClass = this.options.markupToolClass || namespace.MarkupTool;
        this.markupTool = new toolClass();
        this.markupTool.setCoreExtension(this);
        this.markupTool.setHotkeysEnabled(!this.options.markupDisableHotkeys);
        this.viewer.toolController.registerTool(this.markupTool);

        return true;
    };

    proto.unload = function() {

        this.hide();

        this.input.detachFrom(this);

        if (this.markupTool) {
            this.viewer.toolController.deregisterTool(this.markupTool);
            this.markupTool = null;
        }

        var svg = this.svg;
        if (svg && this.onMouseDownBinded) {
            svg.removeEventListener("mousedown", this.onMouseDownBinded);
            this.onMouseDownBinded = null;
        }
        if (svg.parentNode) {
            svg.parentNode.removeChild(svg);
        }
        this.editModeSvgLayerNode = null;
        this.svg = null;

        return true;
    };

    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.toggleEditMode = function() {
        if (this.duringEditMode) {
            this.leaveEditMode();
        } else {
            this.enterEditMode();
        }
    };

    /**
     * Enables click/touch interactions over Viewer canvas to create/draw markups.<br>
     * Exit editMode by calling [leaveEditMode()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#leaveEditMode}.<br>
     * See also:
     * [show()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#show}
     * @returns {boolean} Returns true if editMode is active
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.enterEditMode = function() {

        // Return if already in edit mode.
        if (this.duringEditMode) {
            return true;
        }

        // If not currently shown, then show
        if (!this.duringViewMode) {
            if (!this.show()){
                return false; // Failed to enter view mode.
            }
        }

        if (!this.editModeSvgLayerNode) {
            this.editModeSvgLayerNode = namespaceUtils.createSvgElement('g');
        }
        this.svg.insertBefore(this.editModeSvgLayerNode, this.svg.firstChild);

        this.input.enterEditMode();
        this.viewer.setActiveNavigationTool(this.markupTool.getName());
        this.allowNavigation(false);
        this.changeEditMode(new namespace.EditModeArrow(this));
        this.actionManager.clear();
        this.styles = {}; // Clear EditMode styles.

        this.duringEditMode = true;
        return true;
    };

    /**
     * Exits from editMode.<br>
     * See also [enterEditMode()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#enterEditMode}
     * @returns {boolean} returns true if edit mode has been deactivated
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.leaveEditMode = function() {

        var NOT_IN_EDIT_MODE = true;
        var WE_ARE_STILL_IN_EDIT_MODE = false;

        if (!this.duringEditMode || !this.duringViewMode) {
            return NOT_IN_EDIT_MODE;
        }

        var viewer = this.viewer;
        if (!viewer) {
            return WE_ARE_STILL_IN_EDIT_MODE; // something is very wrong...
        }

        this.svg.removeChild(this.editModeSvgLayerNode);

        this.input.leaveEditMode();
        this.editFrame.setMarkup(null);
        viewer.setActiveNavigationTool(this.markupTool.getName());
        this.allowNavigation(true);

        this.editMode.destroy();
        this.editMode = null;

        this.duringEditMode = false;
        return NOT_IN_EDIT_MODE;
    };

    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.toggle = function() {
        if (this.duringViewMode) {
            this.hide();
        } else {
            this.show();
        }
    };

    /**
     * Enables loading of previously saved markups.<br>
     * Exit editMode by calling [hide()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#hide}.<br>
     * See also:
     * [enterEditMode()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#enterEditMode}
     * @returns {boolean} Whether it successfully entered view mode or not.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.show = function() {

        var viewer = this.viewer;
        if (!viewer || !viewer.model) {
            return false;
        }

        // Return if already showing or in edit-mode.
        // Notice that edit mode requires that we are currently show()-ing.
        if (this.duringViewMode || this.duringEditMode) {
            return true;
        }

        viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onCameraChangeBinded);
        viewer.addEventListener(Autodesk.Viewing.VIEWER_RESIZE_EVENT, this.onViewerResizeBinded);

        // Add parent svg of all markups.
        viewer.container.appendChild(this.svg);

        this.input.enterViewMode();
        namespaceUtils.hideLmvUi(viewer);

        // TODO: Nasty hack, currently there is no API to disable mouse highlighting in 3d models.
        // TODO: We nuke rollover function in viewer, for now, public api will be added soon.
        this.onViewerRolloverObject = viewer.impl.rolloverObject;
        viewer.impl.rolloverObject = function(){};

        if (!this.options.markupBypassOrthoCam) {
            namespaceUtils.forceOrthographicCamera(viewer);
        }

        this.cachedNavigationTool = this.viewer.getActiveNavigationTool();
        viewer.setActiveNavigationTool(this.markupTool.getName());
        this.allowNavigation(true);
        var camera = viewer.impl.camera;
        this.onViewerResize({ width: camera.clientWidth, height: camera.clientHeight });
        this.clear();

        // See function loadMarkups() for when the actual SVG gets added onstage //
        this.svgLayersMap = {};
        this.duringViewMode = true;
        return true;
    };

    /**
     * Removes any markup currently overlaid on the viewer. It will also exit EditMode if it is active.<br>
     * See also:
     * [show()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#show}
     * @returns {boolean} Whether it successfully left view mode or not.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.hide = function() {

        var RESULT_HIDE_OK = true;
        var RESULT_HIDE_FAIL = false;

        var viewer = this.viewer;
        if (!viewer || !this.duringViewMode) {
            return RESULT_HIDE_OK;
        }

        if (this.duringEditMode) {
            if (!this.leaveEditMode()) {
                return RESULT_HIDE_FAIL;
            }
        }

        viewer.removeEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, this.onCameraChangeBinded);
        viewer.removeEventListener(Autodesk.Viewing.VIEWER_RESIZE_EVENT, this.onViewerResizeBinded);

        var svg = this.svg;
        svg.parentNode && svg.parentNode.removeChild(svg);

        // Remove all Markups and metadata (if any)
        this.unloadMarkupsAllLayers();
        namespaceUtils.removeAllMetadata(svg);

        this.input.leaveViewMode();
        namespaceUtils.restoreLmvUi(viewer);
        this.viewer.impl.rolloverObject = this.onViewerRolloverObject;

        this.viewer.setActiveNavigationTool(this.cachedNavigationTool);
        this.cachedNavigationTool = null;

        this.duringViewMode = false;
        return RESULT_HIDE_OK;
    };

    /**
     * Removes all markups from screen.<br>
     * Markups should have been added while in
     * [Edit Mode]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#enterEditMode}.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.clear = function() {

        var markups = this.markups;
        while(markups.length > 0) {

            var markup = markups[0];
            this.removeMarkup(markup);
            markup.destroy();
        }

        // At this point no other markups should be available.
        var svg = this.editModeSvgLayerNode;
        if (svg && svg.childNodes.length > 0) {
            while (svg.childNodes.length) {
                svg.removeChild(svg.childNodes[0]);
            }
        }
    };

    /**
     * Returns an SVG string with the markups created so far.<br>
     * Markups should have been added while in
     * [Edit Mode]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#enterEditMode}.
     * @returns {string}
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.generateData = function() {

        // Sanity check, remove any lingering metadata nodes
        namespaceUtils.removeAllMetadata(this.svg);


        var tmpNode = namespaceUtils.createSvgElement("svg");
        namespaceUtils.transferChildNodes(this.svg, tmpNode); // Transfer includes this.editModeSvgLayerNode
        namespaceUtils.transferChildNodes(this.editModeSvgLayerNode, this.svg);

        var metadataObject = {
            "data-model-version": "1"
        };
        var metadataNode = namespaceUtils.addSvgMetadata(this.svg, metadataObject);
        var metadataNodes = [ metadataNode ];

        // Notify each markup to inject metadata
        this.markups.forEach(function(markup){
            var addedNode = markup.setMetadata();
            if (addedNode) {
                metadataNodes.push(addedNode);
            }
        });

        // Generate the data!
        var data = namespaceUtils.svgNodeToString(this.svg);

        // Remove metadataObject before returning
        metadataNodes.forEach(function(metadataNode){
            metadataNode.parentNode.removeChild(metadataNode);
        });

        namespaceUtils.transferChildNodes(this.svg, this.editModeSvgLayerNode);
        namespaceUtils.transferChildNodes(tmpNode, this.svg);
        tmpNode = null; // get rid of it.

        return  data;
    };

    /**
     * Renders markups currently present on the canvas to be rendered into a &lt;canvas&gt; 2d context.<br>
     * Internally, it will use each EditMode's renderToCanvas() api.<br>
     * The intended use-case is to generate an image.
     * @param {CanvasRenderingContext2D} context
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.renderToCanvas = function(context) {
        this.markups.forEach(function(markup){
            context.save();
            markup.renderToCanvas(context);
            context.restore();
        });
    };

    /**
     * Changes the active drawing tool.<br>
     * Use this method to change from, for example: the Arrow drawing tool into the Rectangle drawing tool.<br>
     * Applicable only while in [Edit Mode]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#enterEditMode}.<br>
     * Fires EVENT_EDITMODE_CHANGED
     * @param editMode
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.changeEditMode = function(editMode) {

        var oldEditMode = this.editMode;
        oldEditMode && oldEditMode.destroy();

        editMode.addEventListener(namespace.EVENT_EDITMODE_CREATION_BEGIN, function() {this.disableMarkupInteractions(true);}.bind(this));
        editMode.addEventListener(namespace.EVENT_EDITMODE_CREATION_END, function(){this.disableMarkupInteractions(false);}.bind(this));
        editMode.addEventListener(namespace.EVENT_MARKUP_DESELECT, function(event){this.fireEvent(event);}.bind(this));

        this.editMode = editMode;
        this.styles[editMode.type] = namespaceUtils.cloneStyle(editMode.getStyle());

        this.fireEvent({type:namespace.EVENT_EDITMODE_CHANGED, target: editMode});
    };

    /**
     * While in [Edit Mode]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#enterEditMode},
     * it switches the click/tap/swipe behavior to allow camera zoom and panning operations.
     *
     * @param {Boolean} allow - Whether camera navigation interactions are active or not.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.allowNavigation = function(allow) {

        var editMode = this.editMode;
        this.navigating = allow;

        if (allow){
            this.svg.setAttribute("pointer-events", "none");
            editMode && this.selectMarkup(null);
        } else {
            this.svg.setAttribute("pointer-events", "painted");
        }

        this.markupTool.allowNavigation(allow);
        editMode && editMode.notifyAllowNavigation(allow);
    };

    /**
     * Sets mouse/tap interactions with all Markups present while in
     * [Edit Mode]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#enterEditMode}.
     * @param {Boolean} disable - Whether markups will interact with mouse/tap actions.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.disableMarkupInteractions = function(disable) {

        this.markups.forEach(function(markup) {markup.disableInteractions(disable);});
    };

    //// Input /////////////////////////////////////////////////////////////////////////////////////////////////////////

    proto.changeInputHandler = function(inputHandler) {

        this.input.detachFrom(this);
        inputHandler.attachTo(this);
        this.input = inputHandler;

        if (this.duringEditMode) {
            inputHandler.enterEditMode();
        }

        if (this.duringViewMode) {
            inputHandler.enterViewMode();
        }
    };

    //// Copy and Paste System /////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Standard copy operation. Applies to any selected Markup. It has effect only when a markup is selected.<br>
     * See also
     * [cut()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#cut} and
     * [paste()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#paste}.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.copy = function() {

        this.clipboard.copy();
    };

    /**
     * Standard cut operation. Applies to any selected Markup, which gets removed from screen at call time.<br>
     * See also
     * [copy()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#copy} and
     * [paste()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#paste}.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.cut = function() {

        this.clipboard.cut();
    };

    /**
     * Standard paste operation. Will paste add to stage any previously copied or cut markup.
     * Can be called repeatedly after after a single copy or cut operation.<br>
     * See also
     * [copy()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#copy} and
     * [cut()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#cut}.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.paste = function() {

        this.clipboard.paste();
    };

    //// Undo and Redo System //////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Will undo the previous operation.<br>
     * The Undo/Redo stacks will track any change done through an EditAction.<br>
     * See also
     * [redo()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#redo},
     * [isUndoStackEmpty()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#isUndoStackEmpty}.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.undo = function() {

        this.actionManager.undo();
    };

    /**
     * Will redo and previously undo operation.<br>
     * See also
     * [undo()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#undo},
     * [isRedoStackEmpty()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#isRedoStackEmpty}.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.redo = function() {

        this.actionManager.redo();
    };

    /**
     * Returns true when [undo()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#undo}
     * will produce no changes.
     * @return {Boolean}
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.isUndoStackEmpty = function() {

        return this.actionManager.isUndoStackEmpty();
    };

    /**
     * Returns true when [redo()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#redo}
     * will produce no changes.
     * @return {Boolean}
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.isRedoStackEmpty = function() {

        return this.actionManager.isRedoStackEmpty();
    };

    proto.beginActionGroup = function() {

        this.actionManager.beginActionGroup();
    };

    proto.closeActionGroup = function() {

        this.actionManager.closeActionGroup();
    };

    proto.cancelActionGroup = function() {

        this.actionManager.cancelActionGroup();
    };

    /**
     * Helper function for generating unique markup ids.
     * @returns {number}
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.getId = function() {

        return ++this.nextId;
    };

    /**
     * @param event
     * @private
     */
    proto.onEditActionHistoryChanged = function(event) {

        var data = event.data;
        var editMode = this.editMode;

        var keepSelection = editMode && editMode.selectedMarkup && editMode.selectedMarkup.id === data.targetId;

        if((data.action !== 'undo' && data.targetId !== -1) ||
            data.action === 'undo' && keepSelection) {

            // Markup can be null when deleting, that's ok, we unselect in that case.
            var markup = this.getMarkup(data.targetId);
            this.selectMarkup(markup);
        }

        this.fireEvent(event);
    };

    /**
     * Returns a markup with the specified id. Returns null when not found.<br>
     * See also:
     * [getSelection()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#getSelection}.
     * @param {String} id Markup identifier.
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.Markup}
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.getMarkup = function(id) {

        var markups = this.markups;
        var markupsCount = markups.length;

        for(var i = 0; i < markupsCount; ++i) {
            if (markups[i].id == id) {
                return markups[i];
            }
        }

        return null;
    };


    /**
     * Selects a markup.  A selected markup gets an overlayed UI that allows transformations such
     * as resizing, rotations and translation.<br>
     * Allows sending null to remove selection from the currently selected markup.
     * See also:
     * [getMarkup()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#getMarkup}.
     * @param {Autodesk.Viewing.Extensions.Markups.Core.Markup|null} markup Markup instance to select, or null.
     */
    proto.selectMarkup = function(markup) {

        if (markup) {

            if (this.editMode.type === markup.type) {
                this.editMode.setSelection(markup);
            } else {

                var editMode = markup.getEditMode();
                editMode.setSelection(null);

                this.changeEditMode(editMode);
                this.setStyle(markup.getStyle());
                this.editMode.setSelection(markup);
            }
        } else {

            this.editMode.setSelection(null);
        }
    };

    /**
     * Returns the currently selected Markup.  A selected markup has custom UI overlayed that allows for
     * resizing, rotation and translation.<br>
     * See also:
     * [selectMarkup()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#selectMarkup}.
     * @returns {Autodesk.Viewing.Extensions.Markups.Core.Markup|null}
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.getSelection = function() {

        return this.editMode.getSelection();
    };

    /**
     * Deletes a markup from the scene. Applies only while in
     * [Edit Mode]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#enterEditMode}.
     * @param {Autodesk.Viewing.Extensions.Markups.Core.Markup} markup
     * @param {Boolean} [dontAddToHistory] Whether delete action can be [undone]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#undo}.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.deleteMarkup = function(markup, dontAddToHistory) {

        var editMode = markup.getEditMode();
        editMode.deleteMarkup(markup, dontAddToHistory);
    };

    proto.addMarkup = function(markup) {

        markup.setParent(this.editModeSvgLayerNode);

        markup.addEventListener(namespace.EVENT_MARKUP_SELECTED, this.onMarkupSelectedBinded);
        markup.addEventListener(namespace.EVENT_MARKUP_DRAGGING, this.onMarkupDraggingBinded);
        markup.addEventListener(namespace.EVENT_MARKUP_ENTER_EDITION, this.onMarkupEnterEditionBinded);
        markup.addEventListener(namespace.EVENT_MARKUP_CANCEL_EDITION, this.onMarkupCancelEditionBinded);
        markup.addEventListener(namespace.EVENT_MARKUP_DELETE_EDITION, this.onMarkupDeleteEditionBinded);

        this.markups.push(markup);
    };

    /**
     *
     * @param markup
     * @private
     */
    proto.removeMarkup = function(markup) {

        markup.setParent(null);

        markup.removeEventListener(namespace.EVENT_MARKUP_SELECTED, this.onMarkupSelectedBinded);
        markup.removeEventListener(namespace.EVENT_MARKUP_DRAGGING, this.onMarkupDraggingBinded);
        markup.removeEventListener(namespace.EVENT_MARKUP_ENTER_EDITION, this.onMarkupEnterEditionBinded);
        markup.removeEventListener(namespace.EVENT_MARKUP_CANCEL_EDITION, this.onMarkupCancelEditionBinded);
        markup.removeEventListener(namespace.EVENT_MARKUP_DELETE_EDITION, this.onMarkupDeleteEditionBinded);

        var markups = this.markups;
        var markupsIndex = markups.indexOf(markup);
        if (markupsIndex !== -1) {
            markups.splice(markupsIndex, 1);
        }

        var editMode = this.editMode;
        if (editMode) {
            var selectedMarkup = editMode.getSelection();
            if (selectedMarkup === markup) {
                this.selectMarkup(null);
            }
        }
    };

    //// Markups style /////////////////////////////////////////////////////////////////////////////////////////////////

    proto.setStyle = function(style) {

        var styles = this.styles;
        var editMode = this.editMode;

        namespaceUtils.copyStyle(style, styles[editMode.type]);
        editMode.setStyle(styles[editMode.type]);
    };

    proto.getStyle = function() {

        return namespaceUtils.cloneStyle(this.styles[this.editMode.type]);
    };

    //// Markups depth order ///////////////////////////////////////////////////////////////////////////////////////////

    /**
     *
     * @param markup
     */
    proto.bringToFront = function(markup) {

        this.sendMarkupTo(markup, this.markups.length-1);
    };

    /**
     *
     * @param markup
     */
    proto.sendToBack = function(markup) {

        this.sendMarkupTo(markup, 0);
    };

    /**
     *
     * @param markup
     */
    proto.bringForward = function(markup) {

        var markupIndex = this.markups.indexOf(markup);
        this.sendMarkupTo(markup, markupIndex+1);
    };

    /**
     *
     * @param markup
     */
    proto.bringBackward = function(markup) {

        var markupIndex = this.markups.indexOf(markup);
        this.sendMarkupTo(markup, markupIndex-1);
    };

    /**
     *
     * @param markup
     * @param index
     * @private
     */
    proto.sendMarkupTo = function(markup, index) {

        var markups = this.markups;
        var markupIndex = markups.indexOf(markup);

        if (markupIndex !== -1 || index < 0 || index >= markups.length) {
            return;
        }

        markups.splice(markupIndex, 1);
        index = markupIndex > index ? index -1 : index;
        markups.splice(index, 0, markup);

        // TODO: Add markup in right position not always at the end.
        markup.setParent(null);
        markup.setParent(this.editModeSvgLayerNode);
    };

    //// Serialization and Restoration of Markups  /////////////////////////////////////////////////////////////////////

    /**
     * Overlays Markup data (SVG string) onto viewer's canvas. A layerId is required to group markups and reference
     * them in operations such as
     * [hideMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#hideMarkups}.<br>
     *
     * See also:
     * [unloadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#unloadMarkups},
     * [hideMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#hideMarkups}.
     *
     * @param {String} markupString - svg string with markups. See also [generateData()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#generateData}.
     * @param {String} layerId - Identifier for the layer where the markup should be loaded to. Example "Layer1".
     * @return {Boolean} Whether the markup string was able to be loaded successfully
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.loadMarkups = function (markupString, layerId) {

        if(!this.duringViewMode) {
            return false;
        }

        if (!layerId) {
            console.warn("loadMarkups failed; missing 2nd argument 'layerId'");
            return false;
        }

        // Can it be parsed into SVG?
        var parent = namespaceUtils.stringToSvgNode(markupString);
        if (!parent) {
            return false;
        }

        // Remove all metadata nodes
        namespaceUtils.removeAllMetadata(parent);

        // Create svg node for layer (if not present)
        var svgLayerNode = this.svgLayersMap[layerId];
        if (!svgLayerNode) {
            svgLayerNode = namespaceUtils.createSvgElement('g');
            this.svg.appendChild(svgLayerNode);
            this.svgLayersMap[layerId] = svgLayerNode;
        }

        var children = parent.childNodes;
        while(children.length) {
            svgLayerNode.appendChild(children[0]);
        }
        return true;
    };

    /**
     * Removes Markups from DOM, which is good to free up some memory.<br>
     *
     * See also:
     * [loadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#loadMarkups},
     * [unloadMarkupsAllLayers()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#unloadMarkupsAllLayers}.
     *
     * @param {String} layerId - Id of the layer containing all markups to unload (from DOM).
     * @return {Boolean} Whether the operation succeeded or not.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.unloadMarkups = function(layerId) {

        if (!layerId) {
            console.warn("unloadMarkups failed; No layerId provided.");
            return false;
        }

        var svgLayerNode = this.svgLayersMap[layerId];
        if (!svgLayerNode) {
            // TODO: Do we need to log anything here?
            return false;
        }

        this.svg.removeChild(svgLayerNode);
        delete this.svgLayersMap[layerId];
        return true;
    };

    /**
     * Unload all markups loaded so far. Great for freeing up memory.
     *
     * See also:
     * [loadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#loadMarkups},
     * [unloadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#unloadMarkups}.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.unloadMarkupsAllLayers = function() {

        for (var layerId in this.svgLayersMap) {
            if (this.svgLayersMap.hasOwnProperty(layerId)) {
                this.svg.removeChild(this.svgLayersMap[layerId]);
            }
        }
        this.svgLayersMap = {};
    };

    /**
     * Hides all markups from a specified layer. Note that markups will be hidden and not unloaded,
     * thus memory will still be consumed to keep them around. However, no additional parsing is required
     * to make them visible again through method
     * [showMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#showMarkups}.
     *
     * See also:
     * [showMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#showMarkups},
     * [unloadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#unloadMarkups},
     * [loadMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#loadMarkups}.
     *
     * @param {String} layerId - Id of the layer containing all markups to unload (from DOM).
     * @return {Boolean} Whether the operation succeeded or not.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.hideMarkups = function(layerId) {

        if (!layerId) {
            console.warn("hideMarkups failed; No layerId provided.");
            return false;
        }

        var svgLayerNode = this.svgLayersMap[layerId];
        if (!svgLayerNode) {
            // TODO: Do we need to log anything here?
            return false;
        }

        svgLayerNode.setAttribute("visibility", "hidden");
    };

    /**
     * Sets a layer containing markups visible again.  Markups can be set non-visible by calling
     * [hideMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#hideMarkups}.
     *
     * See also:
     * [hideMarkups()]{@link Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore#hideMarkups}.
     *
     * @param {String} layerId - Id of the layer containing all markups to unload (from DOM).
     * @return {Boolean} Whether the operation succeeded or not.
     */
    Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore.prototype.showMarkups = function(layerId) {

        if (!layerId) {
            console.warn("showMarkups failed; No layerId provided.");
            return false;
        }

        var svgLayerNode = this.svgLayersMap[layerId];
        if (!svgLayerNode) {
            // TODO: Do we need to log anything here?
            return false;
        }

        svgLayerNode.setAttribute("visibility", "visible");
    };

    //// Client Space <-> Markup Space /////////////////////////////////////////////////////////////////////////////////

    proto.positionFromClientToMarkups = function(x, y) {

        return this.clientToMarkups(x, y);
    };

    proto.positionFromMarkupsToClient = function(x, y) {

        return this.markupsToClient(x, y);
    };

    proto.sizeFromClientToMarkups = function(w, h) {

        var a = this.clientToMarkups(0, 0);
        var b = this.clientToMarkups(w, h);

        return {x: Math.abs(b.x - a.x), y: Math.abs(b.y - a.y)};
    };

    proto.sizeFromMarkupsToClient = function(w, h) {

        var a = this.markupsToClient(0, 0);
        var b = this.markupsToClient(w, h);

        return {x: Math.abs(b.x - a.x), y: Math.abs(b.y - a.y)};
    };

    proto.markupsToClient = function(x, y) {

        var point = new THREE.Vector3(x, y, 0);
        var camera = this.viewer.impl.camera;

        point.applyMatrix4(camera.matrixWorld);
        point.sub(camera.position);
        point = namespaceUtils.worldToClient(point, this.viewer, false);

        return point;
    };

    proto.clientToMarkups = function(x, y) {

        var point = namespaceUtils.clientToWorld(x, y, 0, this.viewer);
        var camera = this.viewer.impl.camera;

        point.add(camera.position).applyMatrix4(camera.matrixWorldInverse);
        point.z = 0;

        return point;
    };

    proto.getSvgViewBox = function(clientWidth, clientHeight) {

        // Get pan offset.
        var lt = this.clientToMarkups(0, 0);
        var rb = this.clientToMarkups(clientWidth, clientHeight);

        var l = Math.min(lt.x, rb.x);
        var t = Math.min(lt.y, rb.y);
        var r = Math.max(lt.x, rb.x);
        var b = Math.max(lt.y, rb.y);

        return [l , t, r-l, b-t].join(' ');
    };

    proto.getBounds = function () {

        return this.bounds;
    };

    proto.getMousePosition = function() {

        return this.input.getMousePosition();
    };

    //// Handled Events ////////////////////////////////////////////////////////////////////////////////////////////////

    proto.onCameraChange = function(event) {

        // Update annotations' parent transform.
        var viewBox = this.getSvgViewBox(this.bounds.width, this.bounds.height);

        // HACK, for some reason the 2nd frame returns an empty canvas.
        // The reason why this happens is that the code above calls into the viewer
        // and a division by zero occurs due to LMV canvas having zero width and height
        // When we detect this case, avoid setting the viewBox value and rely on one
        // previously set.
        if (viewBox === "NaN NaN NaN NaN") {
            return;
        }

        this.svg.setAttribute('viewBox', viewBox);

        // Edit frame has to be updated, re-setting the selected markup does the job.
        var editMode = this.editMode;
        if (editMode) {
            var selectedMarkup = editMode.getSelection();
            this.editFrame.setMarkup(selectedMarkup);
        }
    };

    proto.onViewerResize = function(event) {

        this.bounds.x = 0;
        this.bounds.y = 0;
        this.bounds.width = event.width;
        this.bounds.height = event.height;

        this.svg.setAttribute('width', this.bounds.width);
        this.svg.setAttribute('height', this.bounds.height);

        this.onCameraChange();
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @private
     */
    proto.onMouseMove = function() {

        if (this.navigating) {
            return;
        }

        // Propagate event to edit frame.
        if (this.editFrame.isActive()) {
            this.editFrame.onMouseMove();
            return;
        }

        this.editMode && this.editMode.onMouseMove();
    };

    /**
     * Handler to mouse down events, used to start creation markups.
     * @private
     */
    proto.onMouseDown = function(event) {

        if (this.navigating) {
            return;
        }

        namespaceUtils.dismissLmvHudMessage();

        var bounds = this.getBounds();
        var mousePosition = this.getMousePosition();

        if (mousePosition.x >= bounds.x && mousePosition.x <= bounds.x + bounds.width &&
            mousePosition.y >= bounds.y && mousePosition.y <= bounds.y + bounds.height) {
            this.editMode.onMouseDown();
        }

        // TODO: There is a better way to do this, implement when undo/redo group.
        if(!this.editMode.creating && event.target === this.svg) {
            this.selectMarkup(null);
        }
        this.ignoreNextMouseUp = false;
    };

    proto.onMouseUp = function() {

        if (this.navigating) {
            return;
        }

        if (this.editFrame.isActive()) {
            this.editFrame.onMouseUp();
            return;
        }

        if(!this.ignoreNextMouseUp) {
            this.editMode.onMouseUp();
        }
    };

    /**
     *
     * @param event
     */
    proto.onMarkupSelected = function(event) {

        this.selectMarkup(event.markup);
        this.fireEvent(event);
    };

    // TODO: Check if these events are still relevant.
    proto.onMarkupDragging = function(event) {

        if (event.dragging) {
            this.editMode.startDragging();
        } else {
            this.editMode.finishDragging();
        }
    };

    proto.onMarkupEnterEdition = function(event) {

    };

    proto.onMarkupCancelEdition = function(event) {

        this.editMode.unselect();
    };

    proto.onMarkupDeleteEdition = function(event) {

        this.removeMarkup(event.markup);
        this.editMode.deleteMarkup();
    };

    Autodesk.Viewing.theExtensionManager.registerExtension('Autodesk.Viewing.MarkupsCore', MarkupsCore);
})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param id
     * @param markup
     * @param position
     * @constructor
     */
    function CloneMarkup(editor, id, markup, position) {

        namespace.EditAction.call(this, editor, 'CLONE-MARKUP', id);

        this.clone = markup.clone();
        this.clone.id = id;
        this.position = {x: position.x, y: position.y};
    }

    CloneMarkup.prototype = Object.create(namespace.EditAction.prototype);
    CloneMarkup.prototype.constructor = CloneMarkup;

    var proto = CloneMarkup.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var clone = this.clone;
        var position = this.position;

        if (editor.getMarkup(this.targetId)) {
            return;
        }

        var markup = clone.clone();
        markup.setPosition(position.x, position.y);

        editor.addMarkup(markup);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CloneMarkup = CloneMarkup;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * @constructor
     */
    function CreateArrow(editor, id, head, tail, style) {

        namespace.EditAction.call(this, editor, 'CREATE-ARROW', id);

        this.selectOnExecution = false;
        this.tail = tail;
        this.head = head;
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateArrow.prototype = Object.create(namespace.EditAction.prototype);
    CreateArrow.prototype.constructor = CreateArrow;

    var proto = CreateArrow.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var arrow = new namespace.MarkupArrow(this.targetId, editor);

        editor.addMarkup(arrow);

        arrow.set(this.head.x, this.head.y, this.tail.x, this.tail.y);
        arrow.setStyle(this.style);

        arrow.created();
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreateArrow = CreateArrow;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * @class
     * Implements an [EditAction]{@link Autodesk.Viewing.Extensions.Markups.Core.EditAction}
     * for creating a Circle [Markup]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup}.
     * Included in documentation as an example of how to create
     * a specific EditAction that deals with Markup creation.
     * Developers are encourage to look into this class's source code and copy
     * as much code as they need. Find link to source code below.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     * @extends Autodesk.Viewing.Extensions.Markups.Core.EditAction
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param rotation
     * @param style
     */
    function CreateCircle(editor, id, position, size, rotation, style) {

        namespace.EditAction.call(this, editor, 'CREATE-CIRCLE', id);

        this.selectOnExecution = false;
        this.position = {x: position.x, y: position.y};
        this.size = {x: size.x, y: size.y};
        this.rotation = rotation;
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateCircle.prototype = Object.create(namespace.EditAction.prototype);
    CreateCircle.prototype.constructor = CreateCircle;

    var proto = CreateCircle.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var circle = new namespace.MarkupCircle(this.targetId, editor);

        editor.addMarkup(circle);

        circle.set(this.position, this.size);
        circle.setRotation(this.rotation);
        circle.setStyle(this.style);

        circle.created();
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreateCircle = CreateCircle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param rotation
     * @param style
     * @constructor
     */
    function CreateCloud(editor, id, position, size, rotation, style) {

        namespace.EditAction.call(this, editor, 'CREATE-CLOUD', id);

        this.selectOnExecution = false;
        this.position = {x: position.x, y: position.y};
        this.size = {x: size.x, y: size.y};
        this.rotation = rotation;
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateCloud.prototype = Object.create(namespace.EditAction.prototype);
    CreateCloud.prototype.constructor = CreateCloud;

    var proto = CreateCloud.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var cloud = new namespace.MarkupCloud(this.targetId, editor);

        editor.addMarkup(cloud);

        cloud.set(this.position, this.size);
        cloud.setRotation(this.rotation);
        cloud.setStyle(this.style);

        cloud.created();
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreateCloud = CreateCloud;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param rotation
     * @param locations
     * @param style
     * @constructor
     */
    function CreateFreehand(editor, id, position, size, rotation, locations, style) {

        namespace.EditAction.call(this, editor, 'CREATE-FREEHAND', id);

        this.selectOnExecution = false;
        this.position = position;
        this.size = size;
        this.rotation = rotation;
        this.movements = locations.concat();
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateFreehand.prototype = Object.create(namespace.EditAction.prototype);
    CreateFreehand.prototype.constructor = CreateFreehand;

    var proto = CreateFreehand.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var freehand = new namespace.MarkupFreehand(this.targetId, editor);

        editor.addMarkup(freehand);

        freehand.set(this.position, this.size, this.movements);
        freehand.setRotation(this.rotation);
        freehand.setStyle(this.style);

        freehand.created();
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreateFreehand = CreateFreehand;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param rotation
     * @param style
     * @constructor
     */
    function CreateRectangle(editor, id, position, size, rotation, style) {

        namespace.EditAction.call(this, editor, 'CREATE-RECTANGLE', id);

        this.selectOnExecution = false;
        this.position = {x: position.x, y: position.y};
        this.size = {x: size.x, y: size.y};
        this.rotation = rotation;
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateRectangle.prototype = Object.create(namespace.EditAction.prototype);
    CreateRectangle.prototype.constructor = CreateRectangle;

    var proto = CreateRectangle.prototype;

    proto.redo = function() {

        var editor = this.editor;
        var rectangle = new namespace.MarkupRectangle(this.targetId, editor);

        editor.addMarkup(rectangle);

        rectangle.set(this.position, this.size);
        rectangle.setRotation(this.rotation);
        rectangle.setStyle(this.style);

        rectangle.created();
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && this.editor.removeMarkup(markup);
    };

    namespace.CreateRectangle = CreateRectangle;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param id
     * @param position
     * @param size
     * @param text
     * @param style
     * @constructor
     */
    function CreateText(editor, id, position, size, text, style ) {

        namespace.EditAction.call(this, editor, 'CREATE-TEXT', id);

        this.text = text;
        this.position = {x: position.x, y: position.y};
        this.size = {x: size.x, y: size.y};
        this.style = namespaceUtils.cloneStyle(style);
    }

    CreateText.prototype = Object.create(namespace.EditAction.prototype);
    CreateText.prototype.constructor = CreateText;

    var proto = CreateText.prototype;

    proto.redo = function () {

        var editor = this.editor;
        var position = this.position;
        var size = this.size;

        var text = new namespace.MarkupText(this.targetId, editor, size);

        editor.addMarkup(text);

        text.setSize(position, size.x, size.y);
        text.setText(this.text);
        text.setStyle(this.style);

        text.forceRedraw();
    };

    proto.undo = function () {

        var markup = this.editor.getMarkup(this.targetId);
        if (markup) {
            this.editor.removeMarkup(markup);
            markup.destroy();
        }
    };

    namespace.CreateText = CreateText;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param arrow
     * @constructor
     */
    function DeleteArrow(editor, arrow) {

        namespace.EditAction.call(this, editor, 'DELETE-ARROW', arrow.id);
        this.createArrow = new namespace.CreateArrow(
            editor,
            arrow.id,
            arrow.head,
            arrow.tail,
            arrow.getStyle());
    }

    DeleteArrow.prototype = Object.create(namespace.EditAction.prototype);
    DeleteArrow.prototype.constructor = DeleteArrow;

    var proto = DeleteArrow.prototype;

    proto.redo = function() {

        this.createArrow.undo();
    };

    proto.undo = function() {

        this.createArrow.redo();
    };

    namespace.DeleteArrow = DeleteArrow;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     * @class
     * Implements an [EditAction]{@link Autodesk.Viewing.Extensions.Markups.Core.EditAction}
     * for deleting a Circle [Markup]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup}.
     * Included in documentation as an example of how to create
     * a specific EditAction that deals with Markup deletion.
     * Developers are encourage to look into this class's source code and copy
     * as much code as they need. Find link to source code below.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     * @extends Autodesk.Viewing.Extensions.Markups.Core.EditAction
     *
     * @param editor
     * @param circle
     */
    function DeleteCircle(editor, circle) {

        namespace.EditAction.call(this, editor, 'DELETE-CIRCLE', circle.id);
        this.createCircle = new namespace.CreateCircle(
            editor,
            circle.id,
            circle.position,
            circle.size,
            circle.rotation,
            circle.getStyle());
    }

    DeleteCircle.prototype = Object.create(namespace.EditAction.prototype);
    DeleteCircle.prototype.constructor = DeleteCircle;

    var proto = DeleteCircle.prototype;

    proto.redo = function() {

        this.createCircle.undo();
    };

    proto.undo = function() {

        this.createCircle.redo();
    };

    namespace.DeleteCircle = DeleteCircle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param cloud
     * @constructor
     */
    function DeleteCloud(editor, cloud) {

        namespace.EditAction.call(this, editor, 'DELETE-CLOUD', cloud.id);
        this.createCloud = new namespace.CreateCloud(
            editor,
            cloud.id,
            cloud.position,
            cloud.size,
            cloud.rotation,
            cloud.getStyle());
    }

    DeleteCloud.prototype = Object.create(namespace.EditAction.prototype);
    DeleteCloud.prototype.constructor = DeleteCloud;

    var proto = DeleteCloud.prototype;

    proto.redo = function() {

        this.createCloud.undo();
    };

    proto.undo = function() {

        this.createCloud.redo();
    };

    namespace.DeleteCloud = DeleteCloud;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param freehand
     * @constructor
     */
    function DeleteFreehand(editor, freehand) {

        namespace.EditAction.call(this, editor, 'DELETE-FREEHAND', freehand.id);
        this.createFreehand = new namespace.CreateFreehand(
            editor,
            freehand.id,
            freehand.position,
            freehand.size,
            freehand.rotation,
            freehand.locations,
            freehand.getStyle());
    }

    DeleteFreehand.prototype = Object.create(namespace.EditAction.prototype);
    DeleteFreehand.prototype.constructor = DeleteFreehand;

    var proto =  DeleteFreehand.prototype;

    proto.redo = function() {

        this.createFreehand.undo();
    };

    proto.undo = function() {

        this.createFreehand.redo();
    };

    namespace.DeleteFreehand = DeleteFreehand;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param rectangle
     * @constructor
     */
    var DeleteRectangle = function(editor, rectangle) {

        namespace.EditAction.call(this, editor, 'DELETE-RECTANGLE', rectangle.id);
        this.createRectangle = new namespace.CreateRectangle(
            editor,
            rectangle.id,
            rectangle.position,
            rectangle.size,
            rectangle.rotation,
            rectangle.getStyle());
    };

    DeleteRectangle.prototype = Object.create(namespace.EditAction.prototype);
    DeleteRectangle.prototype.constructor = DeleteRectangle;

    var proto = DeleteRectangle.prototype;

    proto.redo = function() {

        this.createRectangle.undo();
    };

    proto.undo = function() {

        this.createRectangle.redo();
    };

    namespace.DeleteRectangle = DeleteRectangle;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param text
     * @constructor
     */
    function DeleteText(editor, text) {

        namespace.EditAction.call(this, editor, 'DELETE-TEXT', text.id);

        var position = {x: text.position.x, y: text.position.y};
        var size = {x: text.size.x, y: text.size.y};

        this.createText = new namespace.CreateText(
            editor,
            text.id,
            position,
            size,
            text.getText(),
            text.getStyle());
    }

    DeleteText.prototype = Object.create(namespace.EditAction.prototype);
    DeleteText.prototype.constructor = DeleteText;

    var proto = DeleteText.prototype;

    proto.redo = function() {

        this.createText.undo();
    };

    proto.undo = function() {

        this.createText.redo();
    };

    namespace.DeleteText = DeleteText;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     * This class will group actions edit actions that should be executed as a whole.
     * When a group is open actions can be added to it, similar actions will be merged into one during this process.
     * This class is not intended to be used by users, it's a helper class of EditActionManager.
     * @constructor
     */
    function EditActionGroup() {

        this.actions = [];
        this.closed = true;
    }

    var proto = EditActionGroup.prototype;

    /**
     *
     * @returns {boolean}
     */
    proto.open = function() {

        if(!this.closed) {
            return false;
        }

        this.closed = false;
        return true;
    };

    /**
     *
     * @returns {boolean}
     */
    proto.close = function() {

        if (this.closed) {
            return false;
        }

        this.closed = true;
        return true;
    };

    /**
     *
     * @returns {number} targetId
     */
    proto.undo = function() {

        var actions = this.actions;
        var actionsMaxIndex = actions.length - 1;

        var targetId = -1;
        for(var i = actionsMaxIndex; i >= 0; --i) {

            var action =  actions[i];
            action.undo();

            if (action.targetId !== -1) {
                targetId = action.targetId;
            }
        }

        return targetId;
    };

    /**
     *
     * @returns {number} targetId
     */
    proto.redo = function() {

        var actions = this.actions;
        var actionsCount = actions.length;

        var targetId = -1;
        for(var i = 0; i < actionsCount; ++i) {

            var action =  actions[i];
            action.redo();

            if (action.targetId !== -1) {
                targetId = action.targetId;
            }
        }

        return targetId;
    };

    /**
     *
     * @returns {boolean}
     */
    proto.isOpen = function() {

        return !this.closed;
    };

    /**
     *
     * @returns {boolean}
     */
    proto.isClosed = function() {

        return this.closed;
    };

    /**
     *
     * @returns {boolean}
     */
    proto.isEmpty = function() {

        return this.actions.length === 0;
    };

    /**
     *
     * @param {EditAction} action
     */
    proto.addAction = function(action) {

        if (this.closed) {
            return false;
        }

        this.actions.push(action);
        this.compact();

        return true;
    };

    /**
     * @private
     */
    proto.compact = function() {

        var actions = this.actions;
        var actionsCount = actions.length;

        for(var i = 0; i < actionsCount; ++i) {

            // If an action does nothing, remove it.
            var actionA = actions[i];
            if (actionA.isIdentity()) {
                actions.splice(i, 1);
                --actionsCount;
                --i;
                continue;
            }

            // If an action can be merged, merge it.
            for (var j = i + 1; j < actionsCount; ++j) {

                var actionB = actions[j];
                if (actionA.type === actionB.type &&
                    actionA.merge(actionB)) {
                    actions.splice(j, 1);
                    --actionsCount;
                    --i;
                    break;
                }
            }
        }
    };

    namespace.EditActionGroup = EditActionGroup;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param arrow
     * @param head
     * @param tail
     * @constructor
     */
    function SetArrow(editor, arrow, head, tail) {

        namespace.EditAction.call(this, editor, 'SET-ARROW', arrow.id);

        this.newHead = {x: head.x, y: head.y};
        this.newTail = {x: tail.x, y: tail.y};
        this.oldHead = {x: arrow.head.x, y: arrow.head.y};
        this.oldTail = {x: arrow.tail.x, y: arrow.tail.y};
    }

    SetArrow.prototype = Object.create(namespace.EditAction.prototype);
    SetArrow.prototype.constructor = SetArrow;

    var proto = SetArrow.prototype;

    proto.redo = function() {

        this.applyState(this.targetId, this.newHead, this.newTail);
    };

    proto.undo = function() {

        this.applyState(this.targetId, this.oldHead, this.oldTail);
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newHead = action.newHead;
            this.newTail = action.newTail;
            return true;
        }
        return false;
    };

    /**
     *
     * @private
     */
    proto.applyState = function(targetId, head, tail) {

        var arrow = this.editor.getMarkup(targetId);
        if(!arrow) {
            return;
        }

        // Different stroke widths make positions differ at sub-pixel level.
        var epsilon = 0.0001;

        if (Math.abs(arrow.head.x - head.x) >= epsilon || Math.abs(arrow.head.y - head.y) >= epsilon ||
            Math.abs(arrow.tail.x - tail.x) >= epsilon || Math.abs(arrow.tail.y - tail.y) >= epsilon) {

            arrow.set(head.x, head.y, tail.x, tail.y);
        }
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return (
            this.newHead.x === this.oldHead.x &&
            this.newHead.y === this.oldHead.y &&
            this.newTail.x === this.oldTail.x &&
            this.newTail.y === this.oldTail.y);
    };

    namespace.SetArrow = SetArrow;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     * @class
     * Implements an [EditAction]{@link Autodesk.Viewing.Extensions.Markups.Core.EditAction}
     * for editing properties of a Circle [Markup]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup}.
     * Included in documentation as an example of how to create
     * a specific EditAction that deals with Markup edition.
     * Developers are encourage to look into this class's source code and copy
     * as much code as they need. Find link to source code below.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     * @extends Autodesk.Viewing.Extensions.Markups.Core.EditAction
     *
     * @param editor
     * @param circle
     * @param position
     * @param size
     */
    function SetCircle(editor, circle, position, size) {

        namespace.EditAction.call(this, editor, 'SET-CIRCLE', circle.id);

        this.newPosition = {x: position.x, y: position.y};
        this.newSize = {x: size.x, y: size.y};
        this.oldPosition = {x: circle.position.x, y: circle.position.y};
        this.oldSize = {x: circle.size.x, y: circle.size.y};
    }

    SetCircle.prototype = Object.create(namespace.EditAction.prototype);
    SetCircle.prototype.constructor = SetCircle;

    var proto = SetCircle.prototype;

    proto.redo = function() {

        this.applyState(this.targetId, this.newPosition, this.newSize);
    };

    proto.undo = function() {

        this.applyState(this.targetId, this.oldPosition, this.oldSize);
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newPosition = action.newPosition;
            this.newSize = action.newSize;
            return true;
        }
        return false;
    };

    /**
     *
     * @private
     */
    proto.applyState = function(targetId, position, size) {

        var circle = this.editor.getMarkup(targetId);
        if(!circle) {
            return;
        }

        // Different stroke widths make positions differ at sub-pixel level.
        var epsilon = 0.0001;

        if (Math.abs(circle.position.x - position.x) > epsilon || Math.abs(circle.size.y - size.y) > epsilon ||
            Math.abs(circle.position.y - position.y) > epsilon || Math.abs(circle.size.y - size.y) > epsilon) {

            circle.set(position, size);
        }
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return (
            this.newPosition.x === this.oldPosition.x &&
            this.newPosition.y === this.oldPosition.y &&
            this.newSize.x === this.oldSize.x &&
            this.newSize.y === this.oldSize.y);
    };

    namespace.SetCircle = SetCircle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param cloud
     * @param position
     * @param size
     * @constructor
     */
    function SetCloud(editor, cloud, position, size) {

        namespace.EditAction.call(this, editor, 'SET-CLOUD', cloud.id);

        this.newPosition = {x: position.x, y: position.y};
        this.newSize = {x: size.x, y: size.y};
        this.oldPosition = {x: cloud.position.x, y: cloud.position.y};
        this.oldSize = {x: cloud.size.x, y: cloud.size.y};
    }

    SetCloud.prototype = Object.create(namespace.EditAction.prototype);
    SetCloud.prototype.constructor = SetCloud;

    var proto = SetCloud.prototype;

    proto.redo = function() {

        this.applyState(this.targetId, this.newPosition, this.newSize, this.newStrokeWidth, this.newColor);
    };

    proto.undo = function() {

        this.applyState(this.targetId, this.oldPosition, this.oldSize, this.oldStrokeWidth, this.oldColor);
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newPosition = action.newPosition;
            this.newSize = action.newSize;
            return true;
        }
        return false;
    };

    /**
     *
     * @private
     */
    proto.applyState = function(targetId, position, size) {

        var cloud = this.editor.getMarkup(targetId);
        if(!cloud) {
            return;
        }

        // Different stroke widths make positions differ at sub-pixel level.
        var epsilon = 0.0001;

        if (Math.abs(cloud.position.x - position.x) > epsilon || Math.abs(cloud.size.y - size.y) > epsilon ||
            Math.abs(cloud.position.y - position.y) > epsilon || Math.abs(cloud.size.y - size.y) > epsilon) {

            cloud.set(position, size);
        }
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return (
            this.newPosition.x === this.oldPosition.x &&
            this.newPosition.y === this.oldPosition.y &&
            this.newSize.x === this.oldSize.x &&
            this.newSize.y === this.oldSize.y);
    };

    namespace.SetCloud = SetCloud;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param freehand
     * @param position
     * @param size
     * @param locations
     * @constructor
     */
    function SetFreehand(editor, freehand, position, size, locations) {

        namespace.EditAction.call(this, editor, 'SET-FREEHAND', freehand.id);

        this.position = position;
        this.size = size;
        this.locations = locations.concat();

        // No need to save old data
    }

    SetFreehand.prototype = Object.create(namespace.EditAction.prototype);
    SetFreehand.prototype.constructor = SetFreehand;

    var proto = SetFreehand.prototype;

    proto.redo = function() {

        var freehand = this.editor.getMarkup(this.targetId);
        if(!freehand) {
            return;
        }

        freehand.set(this.position, this.size, this.locations);
    };

    proto.undo = function() {
        // No need for undo.
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.locations = action.locations.concat();
            this.position = action.position;
            this.size = action.size;
            return true;
        }
        return false;
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return false; // No need to optimize, always false.
    };

    namespace.SetFreehand = SetFreehand;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    function SetPosition(editor, markup, position) {

        namespace.EditAction.call(this, editor, 'SET-POSITION', markup.id);

        this.newPosition = {x: position.x, y: position.y};
        this.oldPosition = {x: markup.position.x, y: markup.position.y};
    }

    SetPosition.prototype = Object.create(namespace.EditAction.prototype);
    SetPosition.prototype.constructor = SetPosition;

    var proto = SetPosition.prototype;

    proto.redo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setPosition(this.newPosition.x, this.newPosition.y);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setPosition(this.oldPosition.x, this.oldPosition.y);
    };

    /**
     *
     * @param action
     * @returns {boolean}
     */
    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newPosition = action.newPosition;
            return true;
        }
        return false;
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        var newPosition = this.newPosition;
        var oldPosition = this.oldPosition;

        return newPosition.x === oldPosition.x && newPosition.y === oldPosition.y;
    };

    namespace.SetPosition = SetPosition;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param rectangle
     * @param position
     * @param size
     * @constructor
     */
    function SetRectangle(editor, rectangle, position, size) {

        namespace.EditAction.call(this, editor, 'SET-RECTANGLE', rectangle.id);

        this.newPosition = {x: position.x, y: position.y};
        this.newSize = {x: size.x, y: size.y};
        this.oldPosition = {x: rectangle.position.x, y: rectangle.position.y};
        this.oldSize = {x: rectangle.size.x, y: rectangle.size.y};
    }

    SetRectangle.prototype = Object.create(namespace.EditAction.prototype);
    SetRectangle.prototype.constructor = SetRectangle;

    var proto = SetRectangle.prototype;

    proto.redo = function() {

        this.applyState(this.targetId, this.newPosition, this.newSize);
    };

    proto.undo = function() {

        this.applyState(this.targetId, this.oldPosition, this.oldSize);
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newPosition = action.newPosition;
            this.newSize = action.newSize;
            return true;
        }
        return false;
    };

    /**
     *
     * @private
     */
    proto.applyState = function(targetId, position, size) {

        var rectangle = this.editor.getMarkup(targetId);
        if(!rectangle) {
            return;
        }

        // Different stroke widths make positions differ at sub-pixel level.
        var epsilon = 0.0001;

        if (Math.abs(rectangle.position.x - position.x) > epsilon || Math.abs(rectangle.size.y - size.y) > epsilon ||
            Math.abs(rectangle.position.y - position.y) > epsilon || Math.abs(rectangle.size.y - size.y) > epsilon) {

            rectangle.set(position, size);
        }
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return(
            this.newPosition.x === this.oldPosition.x &&
            this.newPosition.y === this.oldPosition.y &&
            this.newSize.x === this.oldSize.x &&
            this.newSize.y === this.oldSize.y);
    };

    namespace.SetRectangle = SetRectangle;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param markup
     * @param angle
     * @constructor
     */
    function SetRotation(editor, markup, angle) {

        namespace.EditAction.call(this, editor, 'SET-ROTATION', markup.id);

        var curAngle = markup.getRotation();

        this.newRotation = {angle: angle};
        this.oldRotation = {angle: curAngle};
    }

    SetRotation.prototype = Object.create(namespace.EditAction.prototype);
    SetRotation.prototype.constructor = SetRotation;

    var proto = SetRotation.prototype;

    proto.redo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setRotation(this.newRotation.angle);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setRotation(this.oldRotation.angle);
    };

    /**
     *
     * @param action
     * @returns {boolean}
     */
    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newRotation = action.newRotation;
            return true;
        }
        return false;
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        return this.newRotation.angle === this.oldRotation.angle;
    };

    namespace.SetRotation = SetRotation;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param markup
     * @param position
     * @param width
     * @param height
     * @constructor
     */
    function SetSize(editor, markup, position, width, height) {

        namespace.EditAction.call(this, editor, 'SET-SIZE', markup.id);

        this.newPosition = {x: position.x, y: position.y};
        this.oldPosition = {x: markup.position.x, y: markup.position.y};
        this.newWidth = width;
        this.oldWidth = markup.size.x;
        this.newHeight = height;
        this.oldHeight = markup.size.y;
    }

    SetSize.prototype = Object.create(namespace.EditAction.prototype);
    SetSize.prototype.constructor = SetSize;

    var proto = SetSize.prototype;

    proto.redo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setSize(this.newPosition, this.newWidth, this.newHeight);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setSize(this.oldPosition, this.oldWidth, this.oldHeight);
    };

    proto.merge = function(action) {

        if (this.targetId === action.targetId &&
            this.type === action.type) {

            this.newPosition = action.newPosition;
            this.newWidth = action.newWidth;
            this.newHeight = action.newHeight;
            return true;
        }
        return false;
    };

    /**
     * @returns {boolean}
     */
    proto.isIdentity = function() {

        var identity =
            this.newPosition.x === this.oldPosition.x &&
            this.newPosition.y === this.oldPosition.y &&
            this.newWidth === this.oldWidth &&
            this.newHeight === this.oldHeight;

        return identity;
    };

    namespace.SetSize = SetSize;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @param markup
     * @param style
     * @constructor
     */
    function SetStyle(editor, markup, style) {

        namespace.EditAction.call(this, editor, 'SET-STYLE', markup.id);

        this.newStyle = namespaceUtils.cloneStyle(style);
        this.oldStyle = markup.getStyle();
    }

    SetStyle.prototype = Object.create(namespace.EditAction.prototype);
    SetStyle.prototype.constructor = SetStyle;

    var proto = SetStyle.prototype;

    proto.redo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setStyle(this.newStyle);
    };

    proto.undo = function() {

        var markup = this.editor.getMarkup(this.targetId);
        markup && markup.setStyle(this.oldStyle);
    };

    namespace.SetStyle = SetStyle;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @param markup
     * @param position
     * @param size
     * @param text
     * @constructor
     */
    function SetText(editor, markup, position, size, text) {

        namespace.EditAction.call(this, editor, 'SET-TEXT', markup.id);

        this.newPosition = {x: position.x, y: position.y};
        this.oldPosition = {x: markup.position.x, y: markup.position.y};
        this.newSize = {x: size.x, y: size.y};
        this.oldSize = {x: markup.size.x, y: markup.size.y};
        this.newText = text;
        this.oldText = markup.getText();
    }

    SetText.prototype = Object.create(namespace.EditAction.prototype);
    SetText.prototype.constructor = SetText;

    var proto = SetText.prototype;

    proto.redo = function() {

        var text = this.editor.getMarkup(this.targetId);
        text && text.set(this.newPosition, this.newSize, this.newText);
    };

    proto.undo = function() {

        var text = this.editor.getMarkup(this.targetId);
        text && text.set(this.oldPosition, this.oldSize, this.oldText);
    };

    namespace.SetText = SetText;

})();

(function() { 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     *
     * @param editor
     * @constructor
     */
    function Clipboard(editor) {

        this.editor = editor;
        this.content = null;
        this.pastePosition = {x:0, y: 0};

        namespaceUtils.addTraitEventDispatcher(this);
    }

    var proto = Clipboard.prototype;

    proto.copy = function() {

        var selectedMarkup = this.editor.getSelection();
        if(!selectedMarkup) {
            return;
        }

        this.content = selectedMarkup.clone();
        this.pastePosition.x = selectedMarkup.position.x;
        this.pastePosition.y = selectedMarkup.position.y;
    };

    proto.cut = function() {

        var selectedMarkup = this.editor.getSelection();
        if(!selectedMarkup) {
            return;
        }

        this.copy();
        this.editor.deleteMarkup(selectedMarkup);
    };

    proto.paste = function() {

        var content = this.content;
        if(!content) {
            return;
        }

        var editor = this.editor;
        var position = this.pastePosition;
        var delta = editor.sizeFromClientToMarkups(20, 20);

        position.x += delta.x;
        position.y -= delta.y;

        var cloneMarkup = new namespace.CloneMarkup(editor, editor.getId(), content, position);
        cloneMarkup.execute();
    };

    namespace.Clipboard = Clipboard;
})();

(function() { 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    function InputHandler() {

        this.editor = null;
        this.mousePosition = {x:0, y:0};
        this.makeSameXY = false; // TODO: FIND a better way to name and communicate these.
        this.snapRotations = false;
        this.keepAspectRatio = false;
        this.constrainAxis = false;

        this.onHammerDragBinded = this.onHammerDrag.bind(this);
        this.onSingleTapBinded = this.onSingleTap.bind(this);
        this.onMouseMoveBinded = this.onMouseMove.bind(this);
        this.onMouseUpBinded = this.onMouseUp.bind(this);
        this.onMouseDownBinded = this.onMouseDown.bind(this);
    }

    var proto = InputHandler.prototype;

    proto.attachTo = function(editor) {

        this.editor && this.detachFrom(this.editor);
        this.editor = editor;

        if (namespaceUtils.isTouchDevice()) {
            this.hammer = new Hammer.Manager(editor.svg, {
                recognizers: [
                    [Hammer.Pan, {event: 'drag', pointers: 1}],
                    [Hammer.Tap, {event: 'singletap', pointers: 1, threshold: 2}]
                ],
                inputClass: Hammer.TouchInput
            });
        }
    };

    proto.detachFrom = function(editor) {

        this.hammer && this.hammer.destroy();

        document.removeEventListener('mousemove', this.onMouseMoveBinded, true);
        document.removeEventListener('mouseup', this.onMouseUpBinded, true);
        this.editor && this.editor.svg.removeEventListener("mousedown", this.onMouseDownBinded);
        this.editor = editor;
    };

    proto.enterEditMode = function() {

        if (this.hammer) {
            this.hammer.on("dragstart dragmove dragend", this.onHammerDragBinded);
            this.hammer.on("singletap", this.onSingleTapBinded);
        }
        document.addEventListener('mousemove', this.onMouseMoveBinded, true);
        document.addEventListener('mouseup', this.onMouseUpBinded, true);
        this.editor.svg.addEventListener("mousedown", this.onMouseDownBinded);
    };

    proto.leaveEditMode = function() {

        if (this.hammer) {
            this.hammer.off("dragstart dragmove dragend", this.onHammerDragBinded);
            this.hammer.off("singletap", this.onSingleTapBinded);
        }
        document.removeEventListener("mousemove", this.onMouseMoveBinded, true);
        document.removeEventListener("mouseup", this.onMouseUpBinded, true);
        this.editor.svg.removeEventListener("mousedown", this.onMouseDownBinded);
    };

    proto.enterViewMode = function() {

    };

    proto.leaveViewMode = function() {

    };

    proto.getMousePosition = function() {

        return {x: this.mousePosition.x, y: this.mousePosition.y};
    };

    proto.onMouseMove = function(event) {

        processMouseEvent(this, event);
        this.editor.onMouseMove();
        event.preventDefault();
    };

    proto.onMouseDown = function(event) {

        processMouseEvent(this, event);
        this.editor.onMouseDown(event); // TODO: There should be no need to send event here.
        event.preventDefault();
    };

    proto.onMouseUp = function(event) {

        processMouseEvent(this, event);
        this.editor.onMouseUp();
        event.preventDefault();
    };

    proto.onHammerDrag = function(event) {

        convertEventHammerToMouse(event);
        switch (event.type) {
            case 'dragstart':
                this.onMouseDown(event);
                break;
            case 'dragmove':
                this.onMouseMove(event);
                break;
            case 'dragend':
                this.onMouseUp(event);
                break;
        }
    };

    proto.onSingleTap = function(event) {

        convertEventHammerToMouse(event);

        this.onMouseDown(event);
        this.onMouseUp(event);
    };

    function processMouseEvent(input, event) {

        var rect = input.editor.svg.getBoundingClientRect();

        input.makeSameXY = event.shiftKey;
        input.snapRotations = event.shiftKey;
        input.keepAspectRatio = event.shiftKey;
        input.constrainAxis = event.shiftKey;

        input.mousePosition.x = event.clientX - rect.left;
        input.mousePosition.y = event.clientY - rect.top;
    }

    function convertEventHammerToMouse(event) {

        // Convert Hammer touch-event X,Y into mouse-event X,Y.
        event.shiftKey = false;
        event.clientX = event.pointers[0].clientX;
        event.clientY = event.pointers[0].clientY;
    }

    namespace.InputHandler = InputHandler;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * @class
     * Base class for all EditModes.<br>
     * An EditMode is responsible for handling user input to create and edit a
     * [Markup]{@link Autodesk.Viewing.Extensions.Markups.Core.Markup}.
     *
     * Any class extending Markup should contain at least the following methods:
     * - deleteMarkup()
     * - onMouseDown()
     * - onMouseMove()
     *
     * A good reference is the Circle EditMode implementation available in
     * [EditModeCircle.js]{@link Autodesk.Viewing.Extensions.Markups.Core.EditModeCircle}.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     *
     * @param {Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore} editor - Markups extension.
     * @param {String} type - An identifier for the EditMode type. Not to be confused by the Markup's id.
     * @param {Array} styleAttributes - Attributes for customization.
     * @constructor
     */
    function EditMode(editor, type, styleAttributes) {

        this.editor = editor;
        this.viewer = editor.viewer;
        this.type = type;
        this.selectedMarkup = null;
        this.dragging = false;
        this.draggingAnnotationIniPosition = null;
        this.draggingMouseIniPosition = new THREE.Vector2();
        this.initialX = 0;
        this.initialY = 0;
        this.minSize = 9; // In pixels
        this.creating = false;
        this.size = {x: 0, y: 0};
        this.style = namespaceUtils.createStyle(styleAttributes, this.viewer);

        namespaceUtils.addTraitEventDispatcher(this);
    }

    // Event types //
    namespace.EVENT_EDITMODE_CREATION_BEGIN = "EVENT_EDITMODE_CREATION_BEGIN";
    namespace.EVENT_EDITMODE_CREATION_END = "EVENT_EDITMODE_CREATION_END";
    namespace.EVENT_MARKUP_DESELECT = "EVENT_MARKUP_DESELECT";

    var proto = EditMode.prototype;

    proto.destroy = function() {

        this.unselect();
        namespaceUtils.removeTraitEventDispatcher(this);
    };

    proto.unselect = function() {

        var fireEv = false;
        var selectedMarkup = this.selectedMarkup;
        if (selectedMarkup) {
            selectedMarkup.unselect();
            this.selectedMarkup = null;
            fireEv = true;
        }

        this.editor.editFrame.setMarkup(null);

        if (fireEv) {
            this.fireEvent({ type: namespace.EVENT_MARKUP_DESELECT });
        }
    };

    proto.createBegin = function() {

        if(!this.creating) {
            this.creating = true;
            this.fireEvent({ type: namespace.EVENT_EDITMODE_CREATION_BEGIN });
        }
    };

    proto.createEnd = function() {

        if (this.creating) {
            this.creating = false;
            this.fireEvent({ type: namespace.EVENT_EDITMODE_CREATION_END });
        }
    };

    /**
     *
     * @param style
     */
    proto.setStyle = function(style) {

        this.style = style;

        var selectedMarkup = this.selectedMarkup;
        if(!selectedMarkup) {
            return;
        }

        var setStyle = new namespace.SetStyle(this.editor, selectedMarkup, style);
        setStyle.execute();
    };

    proto.getStyle = function() {

        return this.style;
    };

    proto.setSelection = function(markup) {

        if (this.selectedMarkup !== markup) {
            this.unselect();
            markup && markup.select();
        }

        this.selectedMarkup = markup;

        var editor = this.editor;
        markup && editor.bringToFront(markup);

        if(!this.creating) {
            editor.editFrame.setMarkup(markup);
        }
    };

    proto.getSelection = function() {

        return this.selectedMarkup;
    };

    /**
     *
     * @param [markup] If provided deletes markup (has to have same type that the edit mode), otherwise deletes selected one.
     * @param [cantUndo] If true to not add deletion to undo history.
     * @returns {boolean}
     */
    proto.deleteMarkup = function (markup, cantUndo) {

        return false;
    };

    /**
     * Used by classes extending EditMode to validate the minimum size (in screen coordinates) of the markup.
     * See minSize attribute
     * @return {Boolean} Whether current size is valid for creating the markup
     * @private
     */
    proto.isMinSizeValid = function() {
        if (this.minSize === 0) return true;
        var tmp = this.editor.sizeFromMarkupsToClient(this.size.x, this.size.y);
        return (tmp.x*tmp.x + tmp.y*tmp.y) >= (this.minSize * this.minSize);
    };

    /**
     * @private
     */
    proto.startDragging = function() {

        var selectedMarkup = this.selectedMarkup;
        var mousePosition = this.editor.getMousePosition();

        if (selectedMarkup) {
            this.dragging = true;
            this.draggingAnnotationIniPosition = selectedMarkup.getClientPosition();
            this.draggingMouseIniPosition.set(mousePosition.x, mousePosition.y);
        }
    };

    /**
     * @private
     */
    proto.finishDragging = function() {

        var dragging = this.dragging;
        var selectedMarkup = this.selectedMarkup;

        this.dragging = false;

        if (selectedMarkup && dragging) {
            selectedMarkup.finishDragging();
        }
    };

    /**
     *
     * @returns {{x: number, y: number}}
     */
    proto.getFinalMouseDraggingPosition = function() {

        var editor = this.editor;
        var bounds = editor.getBounds();
        var mousePosition = editor.getMousePosition();

        var initialX = this.initialX;
        var initialY = this.initialY;

        var finalX = Math.min(Math.max(bounds.x, mousePosition.x), bounds.x + bounds.width);
        var finalY = Math.min(Math.max(bounds.y, mousePosition.y), bounds.y + bounds.height);

        if (finalX == initialX &&
            finalY == initialY) {
            finalX++;
            finalY++;
        }

        // Make equal x/y when shift is down
        if (editor.input.makeSameXY) {
            var dx = Math.abs(finalX - initialX);
            var dy = Math.abs(finalY - initialY);

            var maxDelta = Math.max(dx, dy);

            // These calculations have the opportunity to go beyond 'bounds'.
            finalX = initialX + maxDelta * namespaceUtils.sign(finalX - initialX);
            finalY = initialY + maxDelta * namespaceUtils.sign(finalY - initialY);
        }

        return { x:finalX, y:finalY };
    };

    proto.notifyAllowNavigation = function(allows) {

    };

    proto.onMouseDown = function () {

    };

    /**
     * Handler to mouse up events, used to start annotations creation.
     * It will cancel the creation of a markup if its minSize conditions are not met.
     *
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseUp = function(event) {

        if (this.selectedMarkup && this.creating && !this.isMinSizeValid()) {

            this.createEnd();
            this.editor.cancelActionGroup();
            this.selectedMarkup = null;

            return; // Yup, just return
        }

        this.finishDragging();
        var selectedMarkup = this.selectedMarkup;
        if (selectedMarkup && this.creating) {

            selectedMarkup.created();
            this.createEnd();

            // Opened on mouse down.
            this.editor.closeActionGroup();
            this.unselect();
        }
    };

    proto.onMouseMove = function (event) {

    };

    proto.onDoubleClick = function(markup) {

    };

    proto.cancelMarkupCreation = function() {

        this.createEnd();
        this.editor.cancelActionGroup();
        this.selectedMarkup = null; // No need to call unselect
    };

    /**
     *
     * @returns {{x: *, y: *}}
     */
    proto.getDraggingPosition = function () {

        var mousePosition = this.editor.getMousePosition();

        var dx = mousePosition.x - this.draggingMouseIniPosition.x;
        var dy = mousePosition.y - this.draggingMouseIniPosition.y;

        return {
            x: this.draggingAnnotationIniPosition.x + dx,
            y: this.draggingAnnotationIniPosition.y + dy
        };
    };

    /**
     *
     * @param x
     * @param y
     * @param bounds
     * @returns {boolean}
     * @orivate
     */
    proto.isInsideBounds = function (x, y, bounds) {

        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    };

    namespace.EditMode = EditMode;

})();

(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @constructor
     */
    function EditModeArrow(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_ARROW, styleAttributes);
    }

    EditModeArrow.prototype = Object.create(namespace.EditMode.prototype);
    EditModeArrow.prototype.constructor = EditModeArrow;


    var proto = EditModeArrow.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var deleteArrow = new namespace.DeleteArrow(this.editor, markup);
            deleteArrow.addToHistory = !cantUndo;
            deleteArrow.execute();
            return true;
        }
        return false;
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseDown = function() {

        namespace.EditMode.prototype.onMouseDown.call(this);

        if (this.selectedMarkup) {
            return;
        }

        var mousePosition = this.editor.getMousePosition();

        this.initialX = mousePosition.x;
        this.initialY = mousePosition.y;

        // Calculate head and tail.
        var width = 1; // TODO: When an Arrow too short is created, it should actually be ignored.
        var head = {x: this.initialX, y: this.initialY};
        var tail = {x: Math.round(head.x + Math.cos( Math.PI * 0.25) * width), y: Math.round(head.y + Math.sin(-Math.PI * 0.25) * width)};

        // Constrain head and tail inside working area.
        var constrain = function(head, tail, width, bounds) {

            if (this.isInsideBounds(tail.x, tail.y, bounds)) {
                return;
            }

            tail.y = Math.round(head.y + Math.sin( Math.PI * 0.25) * width);
            if (this.isInsideBounds( tail.x, tail.y, bounds)) {
                return;
            }

            tail.x = Math.round(head.y + Math.cos(-Math.PI * 0.25) * width);
            if (this.isInsideBounds( tail.x, tail.y, bounds)) {
                return;
            }

            tail.y = Math.round(head.y + Math.sin(-Math.PI * 0.25) * width);

        }.bind(this);

        var editor = this.editor;
        constrain( head, tail, width, editor.getBounds());

        // Create arrow.
        editor.beginActionGroup();

        head = editor.positionFromClientToMarkups(head.x, head.y);
        tail = editor.positionFromClientToMarkups(tail.x, tail.y);
        this.size = {x: tail.x - head.x, y: tail.y - head.y};

        var arrowId = editor.getId();
        var create = new namespace.CreateArrow(editor, arrowId, head, tail, this.style);
        create.execute();

        this.selectedMarkup = editor.getMarkup(arrowId);
        this.createBegin();
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseMove = function(event) {

        namespace.EditMode.prototype.onMouseMove.call( this, event );

        var selectedMarkup = this.selectedMarkup;
        if(!selectedMarkup || !this.creating) {
            return;
        }

        var editor = this.editor;
        var final = this.getFinalMouseDraggingPosition();

        var head = editor.positionFromClientToMarkups(this.initialX, this.initialY);
        var tail = editor.positionFromClientToMarkups(final.x, final.y);
        this.size = {x: tail.x - head.x, y: tail.y - head.y};

        var setArrow = new namespace.SetArrow(editor, selectedMarkup, head, tail);
        setArrow.execute();
    };

    namespace.EditModeArrow = EditModeArrow;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     * @class
     * Implements a Circle [EditMode]{@link Autodesk.Viewing.Extensions.Markups.Core.EditMode}.
     * Included in documentation as an example of how to create
     * an EditMode for a specific markup type. Developers are encourage to look into this class's source code and copy
     * as much code as they need. Find link to source code below.
     *
     * @tutorial feature_markup
     * @constructor
     * @memberof Autodesk.Viewing.Extensions.Markups.Core
     * @extends Autodesk.Viewing.Extensions.Markups.Core.EditMode
     *
     * @param {Autodesk.Viewing.Extensions.Markups.Core.MarkupsCore} editor
     */
    function EditModeCircle(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_CIRCLE, styleAttributes);
    }

    EditModeCircle.prototype = Object.create(namespace.EditMode.prototype);
    EditModeCircle.prototype.constructor = EditModeCircle;

    var proto = EditModeCircle.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var deleteCircle = new namespace.DeleteCircle(this.editor, markup);
            deleteCircle.addToHistory = !cantUndo;
            deleteCircle.execute();
            return true;
        }
        return false;
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseMove = function(event) {

        namespace.EditMode.prototype.onMouseMove.call( this, event );

        var selectedMarkup = this.selectedMarkup;
        if(!selectedMarkup || !this.creating) {
            return;
        }

        var editor = this.editor;
        var initialX = this.initialX;
        var initialY = this.initialY;

        var final = this.getFinalMouseDraggingPosition();
        var position = editor.clientToMarkups((initialX + final.x)/2, (initialY + final.y)/2);
        var size = this.size = editor.sizeFromClientToMarkups((final.x - initialX), (final.y - initialY));

        var setCircle = new namespace.SetCircle(
            editor,
            selectedMarkup,
            position,
            size);

        setCircle.execute();
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseDown = function() {

        namespace.EditMode.prototype.onMouseDown.call(this);

        if (this.selectedMarkup) {
            return;
        }

        var editor = this.editor;
        var mousePosition = editor.getMousePosition();

        this.initialX = mousePosition.x;
        this.initialY = mousePosition.y;

        // Calculate center and size.
        var position = editor.clientToMarkups(this.initialX, this.initialY);
        var size = this.size = editor.sizeFromClientToMarkups(1, 1);

        // Create circle.
        editor.beginActionGroup();

        var markupId = editor.getId();
        var create = new namespace.CreateCircle(
            editor,
            markupId,
            position,
            size,
            0,
            this.style);
        create.execute();

        this.selectedMarkup = editor.getMarkup(markupId);
        this.createBegin();
    };

    namespace.EditModeCircle = EditModeCircle;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @constructor
     */
    function EditModeCloud(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_CLOUD, styleAttributes);
    }

    EditModeCloud.prototype = Object.create(namespace.EditMode.prototype);
    EditModeCloud.prototype.constructor = EditModeCloud;

    var proto = EditModeCloud.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var deleteCloud = new namespace.DeleteCloud(this.editor, markup);
            deleteCloud.addToHistory = !cantUndo;
            deleteCloud.execute();
            return true;
        }
        return false;
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseMove = function(event) {

        namespace.EditMode.prototype.onMouseMove.call( this, event );

        var selectedMarkup = this.selectedMarkup;
        if(!selectedMarkup || !this.creating) {
            return;
        }

        var editor = this.editor;
        var initialX = this.initialX;
        var initialY = this.initialY;

        var final = this.getFinalMouseDraggingPosition();
        var position = editor.clientToMarkups((initialX + final.x)/2, (initialY + final.y)/2);
        var size = this.size = editor.sizeFromClientToMarkups((final.x - initialX), (final.y - initialY));

        var setCloud = new namespace.SetCloud(
            editor,
            selectedMarkup,
            position,
            size);

        setCloud.execute();
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseDown = function() {

        namespace.EditMode.prototype.onMouseDown.call(this);

        if (this.selectedMarkup) {
            return;
        }

        var editor = this.editor;
        var mousePosition = editor.getMousePosition();

        this.initialX = mousePosition.x;
        this.initialY = mousePosition.y;

        // Calculate center and size.
        var position = editor.clientToMarkups(this.initialX, this.initialY);
        var size = this.size = editor.sizeFromClientToMarkups(1, 1);

        // Create Cloud.
        editor.beginActionGroup();

        var markupId = editor.getId();
        var create = new namespace.CreateCloud(
            editor,
            markupId,
            position,
            size,
            0,
            this.style);

        create.execute();

        this.selectedMarkup = editor.getMarkup(markupId);
        this.createBegin();
    };

    namespace.EditModeCloud = EditModeCloud;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @constructor
     */
    function EditModeFreehand(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_FREEHAND, styleAttributes);
        this.style['stroke-opacity'] = 0.75;
    }

    EditModeFreehand.prototype = Object.create(namespace.EditMode.prototype);
    EditModeFreehand.prototype.constructor = EditModeFreehand;

    var proto = EditModeFreehand.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var deleteFreehand = new namespace.DeleteFreehand(this.editor, markup);
            deleteFreehand.addToHistory = !cantUndo;
            deleteFreehand.execute();
            return true;
        }
        return false;
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseMove = function(event) {

        namespace.EditMode.prototype.onMouseMove.call( this, event );

        var selectedMarkup = this.selectedMarkup;
        if(!selectedMarkup || !this.creating) {
            return;
        }

        var editor = this.editor;
        var mousePosition = editor.getMousePosition();
        var movements = this.movements;

        var location = editor.clientToMarkups(mousePosition.x, mousePosition.y);
        movements.push(location);

        // determine the position of the top-left and bottom-right points
        var minFn = function(collection, key){
            var targets = collection.map(function(item){
                return item[key];
            });
            return Math.min.apply(null, targets);
        };

        var maxFn = function(collection, key){
            var targets = collection.map(function(item){
                return item[key];
            });
            return Math.max.apply(null, targets);
        };
        
        var l = minFn(movements, 'x');
        var t = minFn(movements, 'y');
        var r = maxFn(movements, 'x');
        var b = maxFn(movements, 'y');

        var width = r - l;  // Already in markup coords space
        var height = b - t; // Already in markup coords space

        var position = {
            x: l + width * 0.5,
            y: t + height * 0.5
        };
        var size = this.size = {x: width, y: height};

        // Adjust points to relate from the shape's center
        var locations = movements.map(function(point){
            return {
                x: point.x - position.x,
                y: point.y - position.y
            };
        });

        var setFreehand = new namespace.SetFreehand(
            editor,
            selectedMarkup,
            position,
            size,
            locations);

        setFreehand.execute();
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseDown = function() {

        namespace.EditMode.prototype.onMouseDown.call(this);

        if (this.selectedMarkup) {
            return;
        }

        var editor = this.editor;
        var mousePosition = editor.getMousePosition();

        this.initialX = mousePosition.x;
        this.initialY = mousePosition.y;

        //set the starting point
        var position = editor.clientToMarkups(this.initialX, this.initialY);
        this.movements = [position];

        var size = this.size = editor.sizeFromClientToMarkups(1, 1);

        // Create arrow.
        editor.beginActionGroup();

        var markupId = editor.getId();
        var create = new namespace.CreateFreehand(
            editor,
            markupId,
            position,
            size,
            0,
            [{x: 0, y: 0 }],
            this.style);

        create.execute();

        this.selectedMarkup = editor.getMarkup(markupId);
        this.createBegin();
    };

    namespace.EditModeFreehand = EditModeFreehand;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @constructor
     */
    function EditModeRectangle(editor) {

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_RECTANGLE, styleAttributes);
    }

    EditModeRectangle.prototype = Object.create(namespace.EditMode.prototype);
    EditModeRectangle.prototype.constructor = EditModeRectangle;

    var proto = EditModeRectangle.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var deleteRectangle = new namespace.DeleteRectangle(this.editor, markup);
            deleteRectangle.addToHistory = !cantUndo;
            deleteRectangle.execute();
            return true;
        }
        return false;
    };

    /**
     * Sets multiple text properties at once
     * @param {Object} style
     */
    proto.setStyle = function (style) {

        namespace.EditMode.prototype.setStyle.call(this, style);

        var rectangle = this.selectedMarkup;
        if(!rectangle) {
            return;
        }

        // TODO: Change to use SetStyle //
        var setRectangle = new namespace.SetRectangle(
            this.editor,
            rectangle,
            rectangle.position,
            rectangle.size);

        setRectangle.execute();
    };

    /**
     * Handler to mouse move events, used to create markups.
     * @param {MouseEvent} event Mouse event.
     * @private
     */
    proto.onMouseMove = function(event) {

        namespace.EditMode.prototype.onMouseMove.call( this, event );

        var selectedMarkup = this.selectedMarkup;
        if(!selectedMarkup || !this.creating) {
            return;
        }

        var editor = this.editor;
        var initialX = this.initialX;
        var initialY = this.initialY;

        var final = this.getFinalMouseDraggingPosition();
        var position = editor.clientToMarkups((initialX + final.x)/2, (initialY + final.y)/2);
        var size = this.size = editor.sizeFromClientToMarkups((final.x - initialX), (final.y - initialY));

        var setRectangle = new namespace.SetRectangle(
            editor,
            selectedMarkup,
            position,
            size);

        setRectangle.execute();
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     * @private
     */
    proto.onMouseDown = function() {

        namespace.EditMode.prototype.onMouseDown.call(this);

        if (this.selectedMarkup) {
            return;
        }

        var editor = this.editor;
        var mousePosition = editor.getMousePosition();

        this.initialX = mousePosition.x;
        this.initialY = mousePosition.y;

        // Calculate center and size.
        var position = editor.clientToMarkups(this.initialX, this.initialY);
        var size = this.size = editor.sizeFromClientToMarkups(1, 1);

        // Create rectangle.
        editor.beginActionGroup();

        var markupId = editor.getId();
        var create = new namespace.CreateRectangle(
            editor,
            markupId,
            position,
            size,
            0,
            this.style);

        create.execute();

        this.selectedMarkup = editor.getMarkup(markupId);
        this.createBegin();
    };

    namespace.EditModeRectangle = EditModeRectangle;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;

    /**
     *
     * @param editor
     * @constructor
     */
    function EditModeText(editor) {

        var styleAttributes = [
            'font-size',
            'stroke-color', 'stroke-opacity',
            'fill-color', 'fill-opacity',
            'font-family',
            'font-style',
            'font-weight'
        ];
        namespace.EditMode.call(this, editor, namespace.MARKUP_TYPE_TEXT, styleAttributes);
        this.style['fill-color'] = '#ffffff';

        var helper = new namespace.EditorTextInput(this.viewer.container, this.editor);
        helper.addEventListener(helper.EVENT_TEXT_CHANGE, this.onHelperTextChange.bind(this), false);
        this.textInputHelper = helper;
        this.onHistoryChangeBinded = this.onHistoryChange.bind(this);
        this.minSize = 0; // No need to size it initially
    }

    EditModeText.prototype = Object.create(namespace.EditMode.prototype);
    EditModeText.prototype.constructor = EditModeText;

    var proto = EditModeText.prototype;

    proto.deleteMarkup = function(markup, cantUndo) {

        markup = markup || this.selectedMarkup;
        if (markup && markup.type == this.type) {
            var deleteText = new namespace.DeleteText(this.editor, markup);
            deleteText.addToHistory = !cantUndo;
            deleteText.execute();
            return true;
        }
        return false;
    };

    /**
     * Handler to mouse down events, used to start markups creation.
     */
    proto.onMouseDown = function() {

        if (this.textInputHelper.isActive()) {
            this.textInputHelper.acceptAndExit();
            return;
        }

        if (this.selectedMarkup) {
            return;
        }

        var editor = this.editor;
        var mousePosition = editor.getMousePosition();
        var clientFontSize = editor.sizeFromMarkupsToClient(0, this.style['font-size']).y;
        var initialWidth = clientFontSize * 15; // Find better way to initialize size.
        var initialHeight = clientFontSize * 3;

        // Center position.
        var size = this.size = editor.sizeFromClientToMarkups(initialWidth, initialHeight);
        var position = editor.positionFromClientToMarkups(
            mousePosition.x + (initialWidth * 0.5),
            mousePosition.y + (initialHeight * 0.5));

        editor.beginActionGroup();

        // Given the initial width and font size, we assume that the text fits in one line.
        var createText = new namespace.CreateText(
            editor,
            editor.getId(),
            position,
            size,
            '',
            this.style);

        createText.execute();

        this.createBegin();
        this.createEnd();

        this.selectedMarkup = editor.getMarkup(createText.targetId);
        this.textInputHelper.setActive(this.selectedMarkup, true);
        this.editor.actionManager.addEventListener(namespace.EVENT_HISTORY_CHANGED, this.onHistoryChangeBinded);
    };

    proto.onDoubleClick = function(markup) {
        if (markup === this.selectedMarkup) {
            this.editor.selectMarkup(null);
            this.textInputHelper.setActive(markup, false);
        }
    };

    proto.onHelperTextChange = function(event) {

        var dataBag = event.data;
        var textMarkup = dataBag.markup;
        var textStyle = dataBag.style;

        this.editor.actionManager.removeEventListener(namespace.EVENT_HISTORY_CHANGED, this.onHistoryChangeBinded);

        // Deal with edge case first: Creating a Label without text
        if (dataBag.newText === '') {

            // If the text field is being created for the first time,
            // we need only to cancel the action group in progress
            if (dataBag.firstEdit) {
                this.editor.cancelActionGroup();
                this.editor.selectMarkup(null);
                return;
            }
            // Else, we must perform a Delete action
            else
            {
                var deleteText = new namespace.DeleteText(this.editor, textMarkup);
                deleteText.execute();
                this.editor.selectMarkup(null);
                return;
            }
        }

        // When the text is created for the first time, an action group
        // is already created and it includes the CreateText action.
        // Thus, no need to begin another action group.
        if (!dataBag.firstEdit) {
            this.editor.beginActionGroup();
        }

        // Size change action //
        var position = this.editor.positionFromClientToMarkups(dataBag.newPos.x, dataBag.newPos.y);
        var size = this.editor.sizeFromClientToMarkups(dataBag.width, dataBag.height);
        var setSize = new namespace.SetSize(
            this.editor,
            textMarkup,
            position,
            size.x,
            size.y);
        setSize.execute();

        // Text change action //
        var setText = new namespace.SetText(
            this.editor,
            textMarkup,
            textMarkup.position,
            textMarkup.size,
            dataBag.newText);
        setText.execute();

        var setStyle = new namespace.SetStyle(
            this.editor,
            textMarkup,
            textStyle
        );
        setStyle.execute();

        // However, we do need to close the action group at this point. For both cases.
        this.editor.closeActionGroup();
        this.editor.selectMarkup(null);

        // There seems to be some rendering issues when coming out of the text-edit mode
        textMarkup.forceRedraw();
    };

    /**
     *
     * @param style
     */
    proto.setStyle = function(style) {

        if (this.textInputHelper.isActive()) {

            this.textInputHelper.setStyle(style);
        } else {
            namespace.EditMode.prototype.setStyle.call(this, style);

            // After changing styles, the text gets screwed up. Fix by re-rendering it.
            var selectedMarkup = this.selectedMarkup;
            if (selectedMarkup) {
                selectedMarkup.forceRedraw();
            }
        }
    };

    /**
     * We want to make sure that the Input Helper gets removed from the screen
     * whenever the user attempts to perform an undo or redo action.
     * @param {Event} event
     * @private
     */
    proto.onHistoryChange = function(event) {
        if (this.textInputHelper.isActive()) {
            this.editor.actionManager.removeEventListener(namespace.EVENT_HISTORY_CHANGED, this.onHistoryChangeBinded);
            this.textInputHelper.setInactive();
        }
    };

    proto.notifyAllowNavigation = function(allows) {
        if (allows && this.textInputHelper.isActive()) {
            this.textInputHelper.acceptAndExit();
        }
    };

    proto.destroy = function() {
        if (this.textInputHelper) {
            if (this.textInputHelper.isActive()) {
                this.textInputHelper.acceptAndExit();
            }
            this.textInputHelper.destroy();
            this.textInputHelper = null;
        }
        namespace.EditMode.prototype.destroy.call(this);
    };

    namespace.EditModeText = EditModeText;

})();
(function(){ 'use strict';

    var namespace = Autodesk.Viewing.Extensions.Markups.Core;
    var namespaceUtils = Autodesk.Viewing.Extensions.Markups.Core.Utils;

    /**
     * Auxiliary class that handles all input for the Label Markup (MarkupText.js)
     * It instantiates a TEXTAREA where the user can input text. When user input is
     * disabled, the textarea gets hidden and further rendering is delegated to
     * MarkupText.js
     *
     * @param {HTMLElement} parentDiv
     * @param {Object} editor - Core Extension
     * @constructor
     */
    function EditorTextInput(parentDiv, editor) {

        this.parentDiv = parentDiv;
        this.editor = editor;

        // Constants
        this.EVENT_TEXT_CHANGE = 'EVENT_CO2_TEXT_CHANGE';

        // The actual TextArea input
        this.textArea = document.createElement('textarea');
        this.textArea.setAttribute('maxlength', '260'); // TODO: Make constant? Change value?
        this.textArea.setAttribute('placeholder', namespaceUtils.Localization.MARKUP_TEXT_DEFAULT_TEXT);
        this.onKeyHandlerBinded = this.onKeyHandler.bind(this);
        this.textArea.addEventListener('keydown', this.onKeyHandlerBinded);

        this.styleTextArea = new namespaceUtils.DomElementStyle(); // TODO: Move this to EditMode.
        this.styleTextArea
            .setAttribute('position', 'absolute')
            .setAttribute('overflow-y', 'hidden');

        // Helper div to measure text width
        this.measureDiv = document.createElement('div');

        // Become an event dispatcher
        namespaceUtils.addTraitEventDispatcher(this);

        this.onResizeBinded = this.onWindowResize.bind(this);
    }

    var proto = EditorTextInput.prototype;

    proto.destroy = function() {

        this.textArea.removeEventListener('keydown', this.onKeyHandlerBinded);
        this.setInactive();
    };

    /**
     * Initializes itself given an Label Markup (textMarkup)
     * @param {Object} textMarkup
     * @param {Boolean} firstEdit - Whether the markup is being edited for the first time.
     */
    proto.setActive = function(textMarkup, firstEdit) {

        if (this.textMarkup === textMarkup) {
            return;
        }

        this.setInactive();
        this.parentDiv.appendChild(this.textArea);
        this.textMarkup = textMarkup;
        this.firstEdit = firstEdit || false;
        this.initFromMarkup();

        // Component breaks when resizing. Thus, we force close it
        window.addEventListener('resize', this.onResizeBinded);

        // Focus on next frame
        var txtArea = this.textArea;
        window.requestAnimationFrame(function(){
            txtArea.focus();
        });
    };

    /**
     * Closes the editor text input and goes back into normal markup edition mode.
     */
    proto.setInactive = function() {

        window.removeEventListener('resize', this.onResizeBinded);

        if (this.textMarkup) {
            this.textMarkup = null;
            this.parentDiv.removeChild(this.textArea);
        }
        this.style = null;
    };

    proto.isActive = function() {

        return !!this.textMarkup;
    };

    /**
     * Applies Markup styles to TextArea used for editing.
     * It also saves a copy of the style object.
     * @private
     */
    proto.initFromMarkup = function() {

        var markup = this.textMarkup;
        var position = markup.getClientPosition(),
            size = markup.getClientSize();

        var left = position.x - size.x * 0.5;
        var top = position.y - size.y * 0.5;

        var lineHeightPercentage = markup.lineHeight + "%";
        this.styleTextArea.setAttribute('line-height', lineHeightPercentage);

        this.setPosAndSize(left, top, size.x, size.y);
        this.setStyle(markup.getStyle());
        this.textArea.value = markup.getText();
    };

    proto.setPosAndSize = function(left, top, width, height) {

        // We also check here that it doesn't overflow out of the canvas
        if (left + width >= this.editor.viewer.container.clientWidth) {
            left = this.editor.viewer.container.clientWidth - (width + 10);
        }
        if (top + height >= this.editor.viewer.container.clientHeight) {
            top = this.editor.viewer.container.clientHeight - (height + 10);
        }

        this.styleTextArea
            // Size and position
            .setAttribute('left', left + 'px')
            .setAttribute('top', top + 'px')
            .setAttribute('width', width + 'px')
            .setAttribute('height', height + 'px');
    };

    proto.setStyle = function(style) {
        if (this.style) {
            // An already present style means that the user
            // has changed the style using the UI buttons.
            // We need to account for the user having changed the
            // width/height of the TextArea. Since there is no event
            // we can detect for it, we do it here.
            var temp = {};
            this.injectSizeValues(temp);
            this.setPosAndSize(
                temp.newPos.x - temp.width * 0.5,
                temp.newPos.y - temp.height * 0.5,
                temp.width, temp.height);
        }
        var fontHeight = this.editor.sizeFromMarkupsToClient(0, style['font-size']).y;
        var textAreaStyle = this.styleTextArea
            // Visuals
            .setAttribute('color', style['stroke-color'])
            .setAttribute('font-family', style['font-family'])
            .setAttribute('font-size', fontHeight + 'px')
            .setAttribute('font-weight', style['font-weight'] ? 'bold' : '')
            .setAttribute('font-style', style['font-style'] ? 'italic' : '')
            .getStyleString();
        this.textArea.setAttribute('style', textAreaStyle);
        this.style = namespaceUtils.cloneStyle(style);
    };

    /**
     * Helper function that, for a given markup with some text in it
     * returns an Array of lines in it.
     * @param {Object} markup
     * @returns {{text, lines}|{text: String, lines: Array.<String>}}
     */
    proto.getTextValuesForMarkup = function(markup) {

        this.setActive(markup, false);
        var textValues = this.getTextValues();
        this.setInactive();
        return textValues;
    };

    /**
     * Returns the current text as one string and an array of lines
     * of how the text is being rendered (1 string per line)
     * @returns {{text: String, lines: Array.<String>}}
     */
    proto.getTextValues = function() {

        var newText = this.textArea.value;
        if (newText === namespaceUtils.Localization.MARKUP_TEXT_DEFAULT_TEXT) {
            newText = '';
        }
        return {
            text: newText,
            lines: this.generateLines()
        };
    };

    /**
     * Function called by UI
     */
    proto.acceptAndExit = function() {

        // If placeholder text, then remove.
        var textValues = this.getTextValues();

        var dataBag = {
            markup: this.textMarkup,
            style: this.style,
            firstEdit: this.firstEdit,
            newText: textValues.text,
            newLines: textValues.lines
        };
        this.injectSizeValues(dataBag);
        this.fireEvent({ type: this.EVENT_TEXT_CHANGE, data: dataBag });
        this.setInactive(); // Do this last //
    };

    /**
     * Injects position, width and height of the textarea rect
     * @param {Object} dataBag
     * @private
     */
    proto.injectSizeValues = function(dataBag) {

        // Explicit usage of parseFloat to remove the 'px' suffix.
        var width = parseFloat(this.textArea.style.width);
        var height = parseFloat(this.textArea.style.height);
        var ox = parseFloat(this.textArea.style.left);
        var oy = parseFloat(this.textArea.style.top);

        dataBag.width = width;
        dataBag.height = height;
        dataBag.newPos = {
            x: ox + (width * 0.5),
            y: oy + (height * 0.5)
        };
    };

    /**
     * Handler for when the window gets resized
     * @param {Object} event - Window resize event
     * @private
     */
    proto.onWindowResize = function(event) {
        window.requestAnimationFrame(function(){
            var str = this.textArea.value;
            this.style = null; // TODO: Revisit this code because style changes are lost by doing this.
            this.initFromMarkup();
            this.textArea.value = str;
        }.bind(this));
    };

    proto.onKeyHandler = function(event) {
        var keyCode = event.keyCode;
        var shiftDown = event.shiftKey;

        // We only allow RETURN when used along with SHIFT
        if (!shiftDown && keyCode === 13) { // Return
            event.preventDefault();
            this.acceptAndExit();
        }
    };

    /**
     * Grabs the text content of the textarea and returns
     * an Array of lines.  Wrapped lines are returned as 2 lines.
     */
    proto.generateLines = function() {

        // First, get lines separated by line breaks:
        var textContent = this.textArea.value;
        var linesBreaks = textContent.split(/\r*\n/);

        var styleMeasureStr = this.styleTextArea.clone()
            .removeAttribute(['top', 'left', 'width', 'height', 'overflow-y'])
            .setAttribute('position','absolute')
            .setAttribute('white-space','nowrap')
            .setAttribute('float','left')
            .setAttribute('visibility','hidden')
            .getStyleString();
        this.measureDiv.setAttribute('style', styleMeasureStr);
        this.parentDiv.appendChild(this.measureDiv);

        var maxLineLength = parseFloat(this.textArea.style.width);

        // Now check whether the lines are wrapped.
        // If so, subdivide into other lines.
        var linesOutput = [];

        for (var i= 0, len = linesBreaks.length; i<len; ++i) {
            var line = trimRight(linesBreaks[i]);
            this.splitLine(line, maxLineLength, linesOutput);
        }

        this.parentDiv.removeChild(this.measureDiv);
        return linesOutput;
    };

    /**
     * Given a String that represents one line of text that is
     * longer than the max length a line is allowed, this method
     * cuts text into several ones that are no longer than the max
     * length.
     *
     * @param {String} text
     * @param {Number} maxLength
     * @param {Array} output
     * @private
     */
    proto.splitLine = function(text, maxLength, output) {

        // End condition
        if (text === '') {
            return;
        }

        var remaining = '';
        var done = false;

        while (!done){
            this.measureDiv.innerHTML = text;
            var lineLen = this.measureDiv.clientWidth;
            if (lineLen <= maxLength) {
                output.push(text);
                this.splitLine(trimLeft(remaining), maxLength, output);
                done = true;
            } else {
                // Need to try with a shorter word!
                var parts = this.getShorterLine(text);
                if (parts.length === 1) {
                    // text is only one word that is way too long.
                    this.splitWord(text, remaining, maxLength, output);
                    done = true;
                } else {
                    text = parts[0];
                    remaining = parts[1] + remaining;
                }
            }
        }
    };

    /**
     * Given a line of text such as "hi there programmer", it returns
     * an array with 2 parts: ["hi there", " programmer"].
     *
     * It accounts for special cases with multi-spaces, such as for
     * "hi there  two-spaces" returns ["hi there", "  two-spaces"]
     *
     * When there is only one word, it returns the whole word:
     * "JustOneWord" returns ["JustOneWord"] (an array of 1 element)
     *
     * @param {String} line
     * @returns {Array}
     */
    proto.getShorterLine = function(line) {

        // TODO: Account for TABs
        // Will probably never do unless a bug is reported.

        var iLastSpace = line.lastIndexOf(' ');
        if (iLastSpace === -1) {
            return [line]; // This is a single word
        }

        // Else
        // Iterate back removing additional spaces (multi spaces)
        while (line.charAt(iLastSpace-1) === ' ') {
            iLastSpace--
        }

        var trailingWord = line.substr(iLastSpace); // Contains the spaces
        var shorterLine = line.substr(0,iLastSpace);
        return [shorterLine, trailingWord];
    };

    /**
     * Given a single word, splits it into multiple lines that fits in maxWidth
     * @param {String} word
     * @param {String} remaining
     * @param {Number} maxLength
     * @param {Array} output
     */
    proto.splitWord = function(word, remaining, maxLength, output) {

        var lenSoFar = 1;
        var fits = true;
        while (fits) {

            var part = word.substr(0,lenSoFar);
            this.measureDiv.innerHTML = part;
            var lineLen = this.measureDiv.clientWidth;

            if (lineLen > maxLength) {

                if (lenSoFar === 1) {
                    // we can't split 1 character any longer.
                    output.push(part);
                    this.splitWord(word.substr(1), remaining, maxLength, output);
                    return;
                }

                // It was fine until one less char //
                var okayWord = word.substr(0,lenSoFar-1);
                output.push(okayWord);
                var extraWord = word.substr(lenSoFar-1);
                this.splitLine(extraWord + remaining, maxLength, output);
                return;
            }

            // Try one more character
            lenSoFar++;

            // Check if we are done with all characters
            if (lenSoFar > word.length) {
                // Okay it fits
                output.push(word);
                return;
            }
        }
    };

    function trimRight(text) {
        if (text.length === 0) {
            return "";
        }
        var lastNonSpace = text.length-1;
        for (var i=lastNonSpace; i>=0; --i) {
            if (text.charAt(i) !== ' ') {
                lastNonSpace = i;
                break;
            }
        }
        return text.substr(0, lastNonSpace+1);
    }

    function trimLeft(text) {
        if (text.length === 0) {
            return "";
        }
        var firstNonSpace = 0;
        for (var i=0; i<text.length; ++i) {
            if (text.charAt(i) !== ' ') {
                firstNonSpace = i;
                break;
            }
        }
        return text.substr(firstNonSpace);
    }

    namespace.EditorTextInput = EditorTextInput;

})();