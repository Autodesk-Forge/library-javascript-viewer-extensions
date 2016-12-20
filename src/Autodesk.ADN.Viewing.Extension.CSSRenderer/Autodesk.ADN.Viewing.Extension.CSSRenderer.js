///////////////////////////////////////////////////////////////////
// CSS Renderer viewer extension
// by Philippe Leefsma, December 2015
//
///////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.CSSRenderer =

  function (viewer, options) {

      Autodesk.Viewing.Extension.call(this, viewer, options);

      var _thisExtension = this;

      var _snapperTool = null;

      var _cssTool = null;

      ///////////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////////
      var toolName = "Autodesk.ADN.Viewing.Tool.CSSRenderer";

      function CSSTool(viewer, toolName) {

          var _cssRenderer = new THREE.CSS3DRenderer();

          var _scene = new THREE.Scene() ;

          this.getNames = function () {

              return [toolName];
          }

          this.getName = function () {

              return toolName;
          }

          this.activate = function (name) {

            var $container = $(viewer.container);

            _cssRenderer.setSize(
              $container.width(),
              $container.height());

            $(_cssRenderer.domElement)
              .css ('pointer-events', 'none')
              .css ('position', 'absolute')
              .css ('top', '0px')
              .css ('z-index', 1)
              .appendTo($container);
          }

          this.addCssObject = function (cssObj) {

              _scene.add(cssObj);
          }

          this.deactivate = function (name) {

          }

          this.update = function (t) {

              _cssRenderer.render(_scene, viewer.navigation.getCamera());

              return false;
          }
      }

      ///////////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////////
      _thisExtension.load = function () {

          var dependencies = [
              "uploads/extensions/Autodesk.ADN.Viewing.Extension.CSSRenderer/CSS3DRenderer.js",
              "uploads/extensions/Autodesk.ADN.Viewing.Extension.CSSRenderer/Autodesk.ADN.Viewing.Tool.Snapper.js"
          ];

          require(dependencies, function() {

              _cssTool = new CSSTool(viewer, toolName);

              viewer.toolController.registerTool(_cssTool);

              viewer.toolController.activateTool(toolName);
  
              _snapperTool = new Autodesk.ADN.Viewing.Tool.Snapper(viewer);
  
              viewer.toolController.registerTool(_snapperTool);

              _snapperTool.clearSelectionFilter();

              _snapperTool.addSelectionFilter('face');

              _snapperTool.showTooltip(true, "Select face");

              _snapperTool.onGeometrySelected(function(face) {

                _snapperTool.showTooltip(false);

                _snapperTool.onGeometrySelected(null);

                viewer.toolController.deactivateTool(
                  _snapperTool.getName());

                var bb = getBoundingBox(face);

                var n = getNormal(face);

                var $iframe = $(document.createElement ('iframe'))
                  .attr('src', 'http://gallery.autodesk.io')
                  .attr('class', 'css-render')
                  .attr('width', '40px')
                  .attr('height', '40px')
                  .css ('display', 'block')
                  .css ('pointer-events', 'auto') ; // not none

                var cssObj = new THREE.CSS3DObject($iframe[0]);

                cssObj.position.set(
                  bb.min.x,
                  bb.min.y,
                  bb.min.z);

                var X = new THREE.Vector3(1, 0, 0);
                var Y = new THREE.Vector3(0, 1, 0);
                var Z = new THREE.Vector3(0, 0, 1);

                cssObj.rotation.set(
                  n.angleTo(X),
                  n.angleTo(Y),
                  n.angleTo(Z));

                cssObj.scale.set(0.1, 0.1, 0.1);

                _cssTool.addCssObject(cssObj);
              });

              _snapperTool.onSelectionCancelled(function() {

                _snapperTool.showTooltip(false);

                _snapperTool.onGeometrySelected(null);

                viewer.toolController.deactivateTool(
                  _snapperTool.getName());
              });

              viewer.toolController.activateTool(
                _snapperTool.getName());

            viewer.addEventListener(
              Autodesk.Viewing.SELECTION_CHANGED_EVENT,
              onItemSelected);

              console.log('Autodesk.ADN.Viewing.Extension.CSSRenderer loaded');
          });

          return true;
      }

      ///////////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////////
      _thisExtension.unload = function () {

          viewer.toolController.deactivateTool(toolName);

          console.log('Autodesk.ADN.Viewing.Extension.CSSRenderer unloaded');

          return true;
      }

      ///////////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////////
      function onItemSelected (event) {

        viewer.removeEventListener(
          Autodesk.Viewing.SELECTION_CHANGED_EVENT,
          onItemSelected);

        if(event.dbIdArray.length) {

          viewer.select([]);
        }
      }

      ///////////////////////////////////////////////////////////////////////////
      //
      //
      ///////////////////////////////////////////////////////////////////////////
      function getBoundingBox(face){

        var min = {
          x: Number.MAX_VALUE,
          y: Number.MAX_VALUE,
          z: Number.MAX_VALUE
        };

        var max = {
          x: Number.MIN_VALUE,
          y: Number.MIN_VALUE,
          z: Number.MIN_VALUE
        };

        for(var i=0; i<face.vertices.length; ++i) {

          var vertex = face.vertices[i];

          if(vertex.x < min.x)
            min.x = vertex.x;

          if(vertex.y < min.y)
            min.y = vertex.y;

          if(vertex.z < min.z)
            min.z = vertex.z;

          if(vertex.x > max.x)
            max.x = vertex.x;

          if(vertex.y > max.y)
            max.y = vertex.y;

          if(vertex.z > max.z)
            max.z = vertex.z;
        }

        return {
          min: min,
          max: max
        }
      }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    function getNormal(face) {

      var v1 = face.vertices[0];
      var v2 = face.vertices[1];
      var v3 = face.vertices[2];

      var dir1 = new THREE.Vector3(
        v2.x - v1.x,
        v2.y - v1.y,
        v2.z - v1.z);

      var dir2 = new THREE.Vector3(
        v3.x - v1.x,
        v3.y - v1.y,
        v3.z - v1.z);

      return dir2.cross(dir1);
    }

    ///////////////////////////////////////////////////////////////////////////
    // dynamic css styles
    //
    ///////////////////////////////////////////////////////////////////////////
    var css = [

      'iframe.css-render {',
        'transform: scale(0.25, 0.25);',
        'transform-origin: top left;',
      '}',

    ].join('\n');

    $('<style type="text/css">' + css + '</style>').appendTo('head');
  }

Autodesk.ADN.Viewing.Extension.CSSRenderer.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.CSSRenderer.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.CSSRenderer;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.CSSRenderer',
  Autodesk.ADN.Viewing.Extension.CSSRenderer);

