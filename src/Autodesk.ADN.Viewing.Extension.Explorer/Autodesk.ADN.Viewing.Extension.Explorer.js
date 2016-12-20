/////////////////////////////////////////////////////////////////////
// Explorer viewer extension
// by Philippe Leefsma, March 2015
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");


Autodesk.ADN.Viewing.Extension.Explorer = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    /////////////////////////////////////////////////////////////////
    // The Explorer tool
    //
    /////////////////////////////////////////////////////////////////
    function ExplorerTool(viewer) {

        this.getNames = function() {

            return ["Autodesk.ADN.Viewing.Tool.ExplorerTool"];
        };

        this.getName = function() {

            return "Autodesk.ADN.Viewing.Tool.ExplorerTool";
        };

        /////////////////////////////////////////////////////////////
        // called when tool is activated
        //
        /////////////////////////////////////////////////////////////
        this.activate = function(name) {

            viewer.navigation.setRequestHomeView(true);

            var position = viewer.navigation.getPosition();
            var target = viewer.navigation.getTarget();
            var worldUp = viewer.navigation.getWorldUpVector();

            var pt = {
                x: position.x - target.x,
                y: position.y - target.y,
                z: position.z - target.z
            }

            this.height = dotProduct(pt, worldUp);

            var rVect = getPerpendicularVector(worldUp);

            this.radius = dotProduct(pt, rVect);
        };

        /////////////////////////////////////////////////////////////
        // called when tool is deactivated
        //
        /////////////////////////////////////////////////////////////
        this.deactivate = function(name) {

            this.activated = false;
        };

        this.speed = 0.3;
        this.phase = "1";
        this.switchPhase = true;

        /////////////////////////////////////////////////////////////
        // update is called by the framework
        // t: time elapsed since tool activated in ms
        /////////////////////////////////////////////////////////////
        this.update = function(t) {

            var target = viewer.navigation.getTarget();
            var worldUp = viewer.navigation.getWorldUpVector();

            var offset = Math.abs(Math.cos(this.speed * t * 0.001));

            // create some effect to keep camera near object
            // while it orbits for a while
            if(offset < 0.01) {

                if(this.switchPhase) {

                    this.switchPhase = false;

                    if (this.phase === "1") {
                        this.phase = "2";
                    }
                    else if (this.phase === "2") {
                        this.phase = "1";
                    }
                }
            }

            if(offset > 0.99) {
                this.switchPhase = true;
            }

            if(this.phase === "1")
                this.offset = offset;

            var height = this.height * (0.5 + 1.5 * this.offset);

            var radius = this.radius * (0.5 + 1.5 * this.offset);

            var center = {
                x: target.x + height * worldUp.x,
                y: target.y + height * worldUp.y,
                z: target.z + height * worldUp.z
            }

            var pos = computeCirclularTrajectory(
              this.speed * t * 0.001,
              radius,
              worldUp,
              center);

            viewer.navigation.setPosition(pos);

            return false;
        };

        /////////////////////////////////////////////////////////////
        // utilities
        //
        /////////////////////////////////////////////////////////////
        function crossProduct(u, v) {

            return {

                x: u.y * v.z - u.z * v.y,
                y: u.z * v.x - u.x * v.z,
                z: u.x * v.y - u.y * v.x
            }
        }

        function dotProduct(u, v) {

            return Math.abs(
              u.x * v.x +
              u.y * v.y +
              u.z * v.z);
        }

        function norm(v) {

            return Math.sqrt(
              v.x * v.x +
              v.y * v.y +
              v.z * v.z);
        }

        function getPerpendicularVector(v) {

            var u = { x: 0, y: 0, z: 0 };

            if(v.x !== 0)
                u = { x: 0, y: 1, z: 0 };
            else if(v.y !== 0)
                u = { x: 1, y: 0, z: 0 };
            else
                u = { x: 1, y: 0, z: 0 };

            return crossProduct(v, u);
        }

        function computeCirclularTrajectory(t, radius, normal, center) {

            // C: center, n: normal, u: perpendicular to n
            // p(t) = r.cos(t).u + r.sin(t).(n x u) + C

            var u = getPerpendicularVector(normal);

            var v = crossProduct(u, normal);

            var pos = {

                x: radius * Math.cos(t) * u.x + radius * Math.sin(t) * v.x + center.x,
                y: radius * Math.cos(t) * u.y + radius * Math.sin(t) * v.y + center.y,
                z: radius * Math.cos(t) * u.z + radius * Math.sin(t) * v.z + center.z
            };

            return pos;
        }
    }

    /////////////////////////////////////////////////////////////////
    // load callback
    //
    /////////////////////////////////////////////////////////////////
    _self.load = function () {

        _self.tool = new ExplorerTool(viewer);

        viewer.toolController.registerTool(_self.tool);

        viewer.toolController.activateTool(_self.tool.getName());

        console.log('Autodesk.ADN.Viewing.Extension.Explorer loaded');
        return true;
    };

    /////////////////////////////////////////////////////////////////
    // unload callback
    //
    /////////////////////////////////////////////////////////////////
    _self.unload = function () {

        viewer.toolController.deactivateTool(_self.tool.getName());

        console.log('Autodesk.ADN.Viewing.Extension.Explorer unloaded');
        return true;
    };
};

Autodesk.ADN.Viewing.Extension.Explorer.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Explorer.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Explorer;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Explorer',
  Autodesk.ADN.Viewing.Extension.Explorer);