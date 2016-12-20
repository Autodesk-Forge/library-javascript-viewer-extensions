///////////////////////////////////////////////////////////////////////////////
// Mesh Importer viewer Extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.MeshImporter = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    ///////////////////////////////////////////////////////////////////////////
    // Private members
    //
    ///////////////////////////////////////////////////////////////////////////

    var _importedModel = null;

    var _controlId = null;

    var _running = false;

    var _self = this;


    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        _controlId = createControl();

        console.log("Autodesk.ADN.Viewing.Extension.MeshImporter loaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        console.log("Autodesk.ADN.Viewing.Extension.MeshImporter unloaded");

        $('#' + _controlId).remove();

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    function createControl() {

        var divId = guid();

        var btnId = guid();

        var fileId = guid();

        var html = [

            '<div id="' + divId + '">',
            '<button  class="btn btn-info" id="' + btnId + '" type="button">Import Mesh</button>',
            '<input type="file" name="file" id="' + fileId + '" style="visibility:hidden"/>',
            '</div>'

        ].join('\n');

        $(viewer.container).append(html);

        $('#' + divId).css({

            'right': '5%',
            'top': '5%',
            'position':'absolute',
            'visibility':'visible',
            'z-index':'100'
        });

        $("#" + btnId).on('click',
          function (event) {

              $("#" + fileId).trigger("click")
          });

        $("#" + fileId).on('change',
          function (event) {

              var file = event.target.files[0];

              if(file) {

                  _self.loadFromFile(file);

                  //cannot load same file twice in input
                  //so need to recreate control

                  $('#' + _controlId).remove();

                  _controlId = createControl();
              }
          });

        return divId;
    };

    ///////////////////////////////////////////////////////////////////////////
    // keyup callback callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onKeyup = function(event){

        if (event.keyCode == 27) { //Escape

            viewer.impl.scene.remove(_importedModel);

            viewer.impl.invalidate(true);

            $(viewer.clientContainer).
                unbind("mousemove", _self.onMouseMove);

            $(viewer.clientContainer).
                unbind("click", _self.onMouseClick);

            $(document).unbind(
                'keyup', _self.onKeyup);

            _running = false;
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.loadFromFile = function(file) {

        var splits = file.name.split('.');

        if (splits[splits.length - 1] == 'json') {

            var reader = new FileReader();

            reader.readAsBinaryString(file);

            reader.onload = function (event) {

                var meshEntityList = JSON.parse(event.target.result);

                _importedModel = createModel(meshEntityList);

                $(viewer.clientContainer).
                    bind("mousemove", _self.onMouseMove);
            };

            reader.onerror = function (event) {
                console.log('Cannot read file: ' + file.name);
            };

            //reader.readAsText(file);
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.createMesh = function () {

        var geometry = new THREE.BoxGeometry(10, 10, 10);

        var mesh = new THREE.Mesh(geometry, _self.material);

        return mesh;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    function createModel(meshDataList){

        function ConvertClr(clr) {

            var bytes = [];

            bytes[0] = (clr >>> 24) & 0xFF; //R
            bytes[1] = (clr >>> 16) & 0xFF; //G
            bytes[2] = (clr >>> 8) & 0xFF;  //B
            bytes[3] = (clr >>> 0) & 0xFF;  //A

            return bytes[2] | (bytes[1] << 8) | (bytes[0] << 16);
        }

        var model = new THREE.Object3D();

        var meshArray = [];

        var center = [0.0, 0.0, 0.0];

        var len = meshDataList.length;

        for (var meshIdx = 0; meshIdx < len; meshIdx++) {

            var meshData = meshDataList[meshIdx];

            var geometry = new THREE.Geometry();

            var vertexArray = [];

            //uncompress vertices array
            for (var i = 0; i < meshData.VertexIndices.length; i += 1) {

                var idx = 3 * meshData.VertexIndices[i];

                vertexArray[i] = new THREE.Vector3(
                    meshData.VertexCoords[idx],
                    meshData.VertexCoords[idx + 1],
                    meshData.VertexCoords[idx + 2]);
            }

            var normalArray = [];

            //uncompress normals array
            for (var i = 0; i < meshData.NormalIndices.length; i += 1) {

                var idx = 3 * meshData.NormalIndices[i];

                normalArray[i] = new THREE.Vector3(
                    meshData.Normals[idx],
                    meshData.Normals[idx + 1],
                    meshData.Normals[idx + 2]);
            }

            //Generate Faces
            for (var i = 0; i < vertexArray.length; i += 3) {

                geometry.vertices.push(vertexArray[i]);
                geometry.vertices.push(vertexArray[i + 1]);
                geometry.vertices.push(vertexArray[i + 2]);

                var face = new THREE.Face3(i, i + 1, i + 2)

                geometry.faces.push(face);

                face.vertexNormals.push(normalArray[i]);
                face.vertexNormals.push(normalArray[i + 1]);
                face.vertexNormals.push(normalArray[i + 2]);
            }

            center[0] += meshData.Center[0];
            center[1] += meshData.Center[1];
            center[2] += meshData.Center[2];

            /*var material = new THREE.MeshLambertMaterial(
            {
                color: ConvertClr(meshData.Color[0]),
                shading: THREE.SmoothShading
            });*/

            var material =  _self.addMaterial(ConvertClr(meshData.Color[0]));

            var mesh = new THREE.Mesh(geometry, material);

            mesh.geometry.dynamic = true;
            mesh.geometry.__dirtyVertices = true;
            mesh.geometry.__dirtyNormals = true;

            meshArray.push(mesh);
        }

        center[0] = center[0] / len;
        center[1] = center[1] / len;
        center[2] = center[2] / len;

        meshArray.forEach(function(mesh){

            mesh.applyMatrix(new THREE.Matrix4().makeTranslation(
                -center[0],
                -center[1],
                -center[2]));

            model.add(mesh);
        });

        return model;
    };

    ///////////////////////////////////////////////////////////////////////////
    // add new material
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.addMaterial = function (color) {

        function newGuid () {

            var d = new Date().getTime();

            var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
                /[xy]/g,
                function (c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
                });

            return guid;
        };

        var material = new THREE.MeshPhongMaterial({color: color});

        viewer.impl.matman().addMaterial(
            'ADN-Material-' + newGuid(),
            material,
            true);

        return material;
    }

    ///////////////////////////////////////////////////////////////////////////
    // mouse move callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onMouseMove = function(e) {

        var pos = _self.screenToWorld(e);

        if(!_running) {

            _running = true;

            viewer.impl.scene.add(_importedModel);

            $(viewer.clientContainer).
                bind("click", _self.onMouseClick);

            $(document).bind(
                'keyup', _self.onKeyup);
        }

        _importedModel.position.set(
            pos.x,
            pos.y,
            pos.z);

        viewer.impl.invalidate(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    // mouse click callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onMouseClick = function(e) {

        var pos = _self.screenToWorld(e);

        _importedModel.position.set(
            pos.x,
            pos.y,
            pos.z);

        viewer.impl.invalidate(true);

        $(viewer.clientContainer).
            unbind("mousemove", _self.onMouseMove);

        $(viewer.clientContainer).
            unbind("click", _self.onMouseClick);

        $(document).unbind(
            'keyup', _self.onKeyup);

        _running = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // screen to world coordinates conversion
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.screenToWorld = function(event) {

        var screenPoint = {
            x: event.clientX,
            y: event.clientY
        };

        var viewport =
            viewer.navigation.getScreenViewport();

        var n = {
            x: (screenPoint.x - viewport.left) / viewport.width,
            y: (screenPoint.y - viewport.top) / viewport.height
        };

        return viewer.navigation.getWorldPoint(n.x, n.y);
    }

    ///////////////////////////////////////////////////////
    // new random guid
    //
    ///////////////////////////////////////////////////////
    function guid() {

        var d = new Date().getTime();

        var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
          /[xy]/g,
          function (c) {
              var r = (d + Math.random() * 16) % 16 | 0;
              d = Math.floor(d / 16);
              return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
          });

        return guid;
    };

    ///////////////////////////////////////////////////////
    // Checks if css is loaded
    //
    ///////////////////////////////////////////////////////
    function isCssLoaded(name) {

        for(var i=0; i < document.styleSheets.length; ++i){

            var styleSheet = document.styleSheets[i];

            if(styleSheet.href && styleSheet.href.indexOf(name) > -1)
                return true;
        };

        return false;
    }

    // loads bootstrap css if needed
    if(!isCssLoaded("bootstrap.css") && !isCssLoaded("bootstrap.min.css")) {

        $('<link rel="stylesheet" type="text/css" href="http://netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.css"/>').appendTo('head');
    }
};

Autodesk.ADN.Viewing.Extension.MeshImporter.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.MeshImporter.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.MeshImporter;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.MeshImporter',
    Autodesk.ADN.Viewing.Extension.MeshImporter);
