///////////////////////////////////////////////////////////////////////////////
// BoundingBox viewer extension
// by Philippe Leefsma, March 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.BoundingBox = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    var _lines = [];
    
    _self.load = function () {

        viewer.addEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            onItemSelected);

        console.log('Autodesk.ADN.Viewing.Extension.BoundingBox loaded');

        return true;
    }

    _self.unload = function () {

        _lines.forEach(function(line){

            viewer.impl.scene.remove(line);
        });

        viewer.impl.sceneUpdated(true);

        viewer.isolate([]);
        viewer.fitToView();

        viewer.removeEventListener(
            Autodesk.Viewing.SELECTION_CHANGED_EVENT,
            onItemSelected);

        console.log('Autodesk.ADN.Viewing.Extension.BoundingBox unloaded');

        return true;
    }

    function onItemSelected (event) {

      if(event.dbIdArray.length) {

          viewer.select([]);

          var bBox = getModifiedWorldBoundingBox(
            event.fragIdsArray,
            viewer.model.getFragmentList()
          );

          drawBox(bBox.min, bBox.max);

          viewer.isolate(event.dbIdArray);
          viewer.fitToView(event.dbIdArray);
      }
    }

    //returns bounding box as it appears in the viewer
    // (transformations could be applied)
    function getModifiedWorldBoundingBox(fragIds, fragList) {

        var fragbBox = new THREE.Box3();
        var nodebBox = new THREE.Box3();

        fragIds.forEach(function(fragId) {

            fragList.getWorldBounds(fragId, fragbBox);
            nodebBox.union(fragbBox);
        });

        return nodebBox;
    }

    // Returns bounding box as loaded in the file
    // (no explosion nor transformation)
    function getOriginalWorldBoundingBox(fragIds, fragList) {

        var fragBoundingBox = new THREE.Box3();
        var nodeBoundingBox = new THREE.Box3();

        var fragmentBoxes = fragList.boxes;

        fragIds.forEach(function(fragId) {

            var boffset = fragId * 6;

            fragBoundingBox.min.x = fragmentBoxes[boffset];
            fragBoundingBox.min.y = fragmentBoxes[boffset+1];
            fragBoundingBox.min.z = fragmentBoxes[boffset+2];
            fragBoundingBox.max.x = fragmentBoxes[boffset+3];
            fragBoundingBox.max.y = fragmentBoxes[boffset+4];
            fragBoundingBox.max.z = fragmentBoxes[boffset+5];

            nodeBoundingBox.union(fragBoundingBox);
        });

        return nodeBoundingBox;
    }

    function drawLines(coordsArray, material) {

        for (var i = 0; i < coordsArray.length; i+=2) {

            var start = coordsArray[i];
            var end = coordsArray[i+1];

            var geometry = new THREE.Geometry();

            geometry.vertices.push(new THREE.Vector3(
                start.x, start.y, start.z));

            geometry.vertices.push(new THREE.Vector3(
                end.x, end.y, end.z));

            geometry.computeLineDistances();

            var line = new THREE.Line(geometry, material);

            viewer.impl.scene.add(line);

            _lines.push(line);
        }
    }

    function drawBox(min, max) {

        var material = new THREE.LineBasicMaterial({
            color: 0xffff00,
            linewidth: 2
        });

        viewer.impl.matman().addMaterial(
            'ADN-Material-Line',
            material,
            true);

        drawLines([

            {x: min.x, y: min.y, z: min.z},
            {x: max.x, y: min.y, z: min.z},

            {x: max.x, y: min.y, z: min.z},
            {x: max.x, y: min.y, z: max.z},

            {x: max.x, y: min.y, z: max.z},
            {x: min.x, y: min.y, z: max.z},

            {x: min.x, y: min.y, z: max.z},
            {x: min.x, y: min.y, z: min.z},

            {x: min.x, y: max.y, z: max.z},
            {x: max.x, y: max.y, z: max.z},

            {x: max.x, y: max.y, z: max.z},
            {x: max.x, y: max.y, z: min.z},

            {x: max.x, y: max.y, z: min.z},
            {x: min.x, y: max.y, z: min.z},

            {x: min.x, y: max.y, z: min.z},
            {x: min.x, y: max.y, z: max.z},

            {x: min.x, y: min.y, z: min.z},
            {x: min.x, y: max.y, z: min.z},

            {x: max.x, y: min.y, z: min.z},
            {x: max.x, y: max.y, z: min.z},

            {x: max.x, y: min.y, z: max.z},
            {x: max.x, y: max.y, z: max.z},

            {x: min.x, y: min.y, z: max.z},
            {x: min.x, y: max.y, z: max.z}],

            material);

        viewer.impl.sceneUpdated(true);
    }
};

Autodesk.ADN.Viewing.Extension.BoundingBox.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.BoundingBox.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.BoundingBox;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.BoundingBox',
    Autodesk.ADN.Viewing.Extension.BoundingBox);

