///////////////////////////////////////////////////////////////////
// Simple Custom Tool viewer extension
// by Philippe Leefsma, March 2015
//
///////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.CustomTool =

    function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    _self.tool = null;

    function AdnTool(viewer, toolName) {

        this.getNames = function() {

            return [toolName];
        };

        this.getName = function() {

            return toolName;
        };

        this.activate = function(name) {

            console.log('-------------------');
            console.log('Tool:activate(name)');
            console.log(name);
        };

        this.deactivate = function(name) {

            console.log('-------------------');
            console.log('Tool:deactivate(name)');
            console.log(name);
        };

        this.update = function(t) {

            //console.log('-------------------');
            //console.log('Tool:update(t)');
            //console.log(t);

            return false;
        };

        this.handleSingleClick = function(event, button) {

            console.log('-------------------');
            console.log('Tool:handleSingleClick(event, button)');
            console.log(event);
            console.log(button);

            return false;
        };

        this.handleDoubleClick = function(event, button) {

            console.log('-------------------');
            console.log('Tool:handleDoubleClick(event, button)');
            console.log(event);
            console.log(button);

            return false;
        };


        this.handleSingleTap = function(event) {

            console.log('-------------------');
            console.log('Tool:handleSingleTap(event)');
            console.log(event);

            return false;
        };


        this.handleDoubleTap = function(event) {

            console.log('-------------------');
            console.log('Tool:handleDoubleTap(event)');
            console.log(event);

            return false;
        };


        this.handleKeyDown = function(event, keyCode) {

            console.log('-------------------');
            console.log('Tool:handleKeyDown(event, keyCode)');
            console.log(event);
            console.log(keyCode);

            return false;
        };

        this.handleKeyUp = function(event, keyCode) {

            console.log('-------------------');
            console.log('Tool:handleKeyUp(event, keyCode)');
            console.log(event);
            console.log(keyCode);

            return false;
        };


        this.handleWheelInput = function(delta) {

            console.log('-------------------');
            console.log('Tool:handleWheelInput(delta)');
            console.log(delta);

            return false;
        };

        this.handleButtonDown = function(event, button) {

            console.log('-------------------');
            console.log('Tool:handleButtonDown(event, button)');
            console.log(event);
            console.log(button);

            return false;
        };

        this.handleButtonUp = function(event, button) {

            console.log('-------------------');
            console.log('Tool:handleButtonUp(event, button)');
            console.log(event);
            console.log(button);

            return false;
        };

        this.handleMouseMove = function(event) {

            //console.log('-------------------');
            //console.log('Tool:handleMouseMove(event)');
            //console.log(event);

            return false;
        };

        this.handleGesture = function(event) {

            console.log('-------------------');
            console.log('Tool:handleGesture(event)');
            console.log(event);

            return false;
        };

        this.handleBlur = function(event) {

            console.log('-------------------');
            console.log('Tool:handleBlur(event)');
            console.log(event);

            return false;
        };

        this.handleResize = function() {

            console.log('-------------------');
            console.log('Tool:handleResize()');
        };
    }

    var toolName = "Autodesk.ADN.Viewing.Tool.CustomTool";

    _self.load = function () {

        _self.tool = new AdnTool(viewer, toolName);

        viewer.toolController.registerTool(_self.tool);

        viewer.toolController.activateTool(toolName);

        console.log('Autodesk.ADN.Viewing.Extension.CustomTool loaded');
        return true;
    };

    _self.unload = function () {

        viewer.toolController.deactivateTool(toolName);

        console.log('Autodesk.ADN.Viewing.Extension.CustomTool unloaded');
        return true;
    };
};

Autodesk.ADN.Viewing.Extension.CustomTool.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.CustomTool.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.CustomTool;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.CustomTool',
    Autodesk.ADN.Viewing.Extension.CustomTool);

