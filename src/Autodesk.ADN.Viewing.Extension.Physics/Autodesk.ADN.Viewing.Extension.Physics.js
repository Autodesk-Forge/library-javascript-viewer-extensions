///////////////////////////////////////////////////////////////////////////////
// Ammo.js Physics viewer extension
// by Philippe Leefsma, December 2014
//
// Dependencies:
//
// https://rawgit.com/kripken/ammo.js/master/builds/ammo.js
// https://rawgit.com/darsain/fpsmeter/master/dist/fpsmeter.min.js
// https://rawgit.com/vitalets/angular-xeditable/master/dist/js/xeditable.min.js
///////////////////////////////////////////////////////////////////////////////

AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Physics = function (viewer, options) {
    
    Autodesk.Viewing.Extension.call(this, viewer, options);
    
    var _fps = null;
    
    var _self = this;
    
    var _panel = null;
    
    var _world = null;
    
    var _meshMap = {};

    var _started = false;
    
    var _running = false;
    
    var _animationId = null;
    
    var _selectedComponent = null;
    
    ///////////////////////////////////////////////////////////////////////////
    // A stopwatch!
    //
    ///////////////////////////////////////////////////////////////////////////
    var Stopwatch = function() {
        
        var _startTime = new Date().getTime();
        
        this.start = function (){
            
            _startTime = new Date().getTime();
        };
        
        this.getElapsedMs = function(){
            
            var elapsedMs = new Date().getTime() - _startTime;
            
            _startTime = new Date().getTime();
            
            return elapsedMs;
        }
    }
    
    var _stopWatch = new Stopwatch();
    
    String.prototype.replaceAll = function (find, replace) {
        return this.replace(
          new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'),
          replace);
    };
    
    ///////////////////////////////////////////////////////////////////////////
    // Extension load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {
        
        console.log('Autodesk.ADN.Viewing.Extension.Physics loading ...');
        
        var dependencies = [
            "uploads/extensions/Autodesk.ADN.Viewing.Extension.Physics/ammo.js",
            "uploads/extensions/Autodesk.ADN.Viewing.Extension.Physics/fpsmeter.min.js",
            "uploads/extensions/Autodesk.ADN.Viewing.Extension.Physics/bootstrap-editable.min.js"
        ];
        
        $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: 'uploads/extensions/Autodesk.ADN.Viewing.Extension.Physics/bootstrap-editable.css'
        }).appendTo('head');
        
        require(dependencies, function() {
            
            _self.initialize(function() {
                
                _panel = _self.loadPanel();
                
                viewer.addEventListener(
                  Autodesk.Viewing.SELECTION_CHANGED_EVENT,
                  _self.onItemSelected);
                
                console.log('Autodesk.ADN.Viewing.Extension.Physics loaded');
            });
        });
        
        return true;
    };
    
    ///////////////////////////////////////////////////////////////////////////
    // Extension unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {
        
        $('#physicsDivId').remove();
        
        _panel.setVisible(false, true);
        
        _panel = null;
        
        _self.stop();
        
        console.log('Autodesk.ADN.Viewing.Extension.Physics unloaded');
        
        return true;
    };
    
    ///////////////////////////////////////////////////////////////////////////
    // Initializes meshes and grab initial properties
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.initialize = function(callback) {
        
        viewer.getObjectTree(function (rootComponent) {
            
            rootComponent.root.children.forEach(function(component) {
                
                var fragIdsArray = (Array.isArray(component.fragIds) ?
                  component.fragIds :
                  [component.fragIds]);
                
                fragIdsArray.forEach(function(subFragId) {
                    
                    var renderProxy = viewer.impl.getRenderProxy(
                      viewer.model,
                      subFragId);
                    
                    var fragProxy = viewer.impl.getFragmentProxy(
                      viewer.model,
                      subFragId);

                    getPropertyValue(
                      component.dbId,
                      "Mass", function(mass) {

                          console.log(component.name + " : " + mass)

                          mass = (mass !== 'undefined' ? mass : 1.0);
                          
                          getPropertyValue(
                            component.dbId,
                            "vInit",
                            function (vInit) {
                                
                                vInit = (vInit !== 'undefined' ? vInit : "0;0;0");
                                
                                vInit = parseArray(vInit, ';');
                                
                                _meshMap[subFragId] = {

                                    //transform: mesh.matrixWorld.clone(),
                                    component: component,
                                    
                                    vAngularInit: [0,0,0],
                                    vAngular: [0,0,0],
                                    
                                    vLinearInit: vInit,
                                    vLinear: vInit,
                                    
                                    mass: mass,
                                    fragProxy: fragProxy,
                                    renderProxy: renderProxy,
                                    body: null
                                }
                            });
                      });
                });
            });
            
            //done
            callback();
        });
    }
    
    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.displayVelocity = function(vLinear, vAngular) {
        
        $('#vx').text(vLinear[0].toFixed(2));
        $('#vy').text(vLinear[1].toFixed(2));
        $('#vz').text(vLinear[2].toFixed(2));
        
        $('#ax').text(vAngular[0].toFixed(2));
        $('#ay').text(vAngular[1].toFixed(2));
        $('#az').text(vAngular[2].toFixed(2));
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onItemSelected = function (event) {
        
        var dbId = event.dbIdArray[0];
        
        if(typeof dbId === 'undefined') {
            $('#editableDivId').css('visibility','collapse');
            return;
        }
        
        $('#editableDivId').css('visibility','visible');
        
        var fragId = event.fragIdsArray[0]
        
        var fragIdsArray = (Array.isArray(fragId) ?
          fragId :
          [fragId]);
        
        var subFragId = fragIdsArray[0];
        
        var vLinear = _meshMap[subFragId].vLinear;
        
        var vAngular = _meshMap[subFragId].vAngular;
        
        _self.displayVelocity(vLinear, vAngular);
        
        _selectedComponent = _meshMap[subFragId];
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Creates control panel
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.loadPanel = function() {
        
        Autodesk.ADN.Viewing.Extension.Physics.ControlPanel = function(
          parentContainer,
          id,
          title,
          content,
          x, y)
        {
            this.content = content;
            
            Autodesk.Viewing.UI.DockingPanel.call(
              this,
              parentContainer,
              id, '',
              {shadow:true});
            
            // Auto-fit to the content and don't allow resize.
            // Position at the given coordinates
            
            this.container.style.top = y + "px";
            this.container.style.left = x + "px";
            
            this.container.style.width = "auto";
            this.container.style.height = "auto";
            this.container.style.resize = "none";
        };
        
        Autodesk.ADN.Viewing.Extension.Physics.
          ControlPanel.prototype = Object.create(
          Autodesk.Viewing.UI.DockingPanel.prototype);
        
        Autodesk.ADN.Viewing.Extension.Physics.
          ControlPanel.prototype.constructor =
          Autodesk.ADN.Viewing.Extension.Physics.ControlPanel;
        
        Autodesk.ADN.Viewing.Extension.Physics.
          ControlPanel.prototype.initialize = function() {
            
            // Override DockingPanel initialize() to:
            // - create a standard title bar
            // - click anywhere on the panel to move
            // - create a close element at the bottom right
            //
            this.title = this.createTitleBar(
              this.titleLabel ||
              this.container.id);
            
            this.container.appendChild(this.title);
            this.container.appendChild(this.content);
            
            this.initializeMoveHandlers(this.container);
            
            this.closer = document.createElement("div");

            this.initializeCloseHandler(this.closer);
            
            this.container.appendChild(this.closer);
        };
        
        var content = document.createElement('div');
        
        content.id = 'physicsDivId';
        
        var panel = new Autodesk.ADN.Viewing.Extension.Physics.
          ControlPanel(
          viewer.container,
          'Physics',
          'Physics',
          content,
          0, 0);
        
        $('#physicsDivId').css('color', 'white');
        
        panel.setVisible(true);
        
        var html =
          '<button id="startBtnId" type="button" style="color:#000000;width:100px">Start</button>' +
          '<button id="resetBtnId" type="button" style="color:#000000;width:100px">Reset</button>' +
          '<div id="editableDivId" ng-controller="editableController" style="visibility: collapse">' +
          '<br>' +
          '<br>&nbsp Linear Velocity: ' +
          '<br> &nbsp Vx = <label id="vx">0.0</label>' +
          '<br> &nbsp Vy = <label id="vy">0.0</label>' +
          '<br> &nbsp Vz = <label id="vz">0.0</label>' +
          '<br><br>&nbsp Angular Velocity: ' +
          '<br> &nbsp Ax = <label id="ax">0.0</label>' +
          '<br> &nbsp Ay = <label id="ay">0.0</label>' +
          '<br> &nbsp Az = <label id="az">0.0</label>' +
          '</div>'
        
        $('#physicsDivId').append(html);
        
        ['#vx', '#vy', '#vz', '#ax', '#ay', '#az'].forEach(function(id) {
            
            $(id).editable({
                type: 'text',
                mode: 'inline',
                autotext:  'always',
                display: function(value) {
                    //$(this).text(value);
                },
                success: function (response, newValue) {
                    
                    var value = parseFloat(newValue);
                    
                    if(!isNaN(value)){
                        
                        $(id).text(newValue);
                        
                        _selectedComponent.vLinear = [
                            parseFloat($('#vx').text()),
                            parseFloat($('#vy').text()),
                            parseFloat($('#vz').text())
                        ];
                        
                        _selectedComponent.vAngular = [
                            parseFloat($('#ax').text()),
                            parseFloat($('#ay').text()),
                            parseFloat($('#az').text())
                        ];
                        
                        if(!_started) {
                            
                            _selectedComponent.vAngularInit =
                              _selectedComponent.vAngular;
                            
                            _selectedComponent.vLinearInit =
                              _selectedComponent.vLinear;
                        }
                    }
                }
            });
        })
        
        _fps = new FPSMeter(content, {
            smoothing: 10,
            show: 'fps',
            toggleOn: 'click',
            decimals: 1,
            zIndex: 999,
            left: '5px',
            top: '60px',
            theme: 'transparent',
            heat: 1,
            graph: 1,
            history: 32});
        
        $('#startBtnId').click(function () {
            
            if (_animationId) {
                
                $("#startBtnId").text('Start');
                
                _self.stop();
            }
            else {
                
                $("#startBtnId").text('Stop');
                
                _self.start();
            }
        })
        
        $('#resetBtnId').click(function () {
            
            if(_running) {
                
                $("#startBtnId").text('Start');
                
                _self.stop();
            }
            
            _self.reset();
        })
        
        return panel;
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Creates physics world
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.createWorld = function() {
        
        var collisionConfiguration =
          new Ammo.btDefaultCollisionConfiguration;
        
        var world = new Ammo.btDiscreteDynamicsWorld(
          new Ammo.btCollisionDispatcher(collisionConfiguration),
          new Ammo.btDbvtBroadphase,
          new Ammo.btSequentialImpulseConstraintSolver,
          collisionConfiguration);
        
        world.setGravity(new Ammo.btVector3(0, 0, -9.8));
        
        return world;
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Starts simulation
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.start = function() {
        
        viewer.select([]);
        
        // force update
        //viewer.setView(viewer.getCurrentView());
        
        _world = _self.createWorld();
        
        for(var key in _meshMap){
            
            var entry = _meshMap[key];
            
            var body = createRigidBody(entry);
            
            _world.addRigidBody(body);
            
            entry.body = body;
        }
        
        _running = true;
        
        _started = true;
        
        _stopWatch.getElapsedMs();
        
        _self.update();
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Stops simulation
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.stop = function() {
        
        // save current velocities
        for(var key in _meshMap){
            
            var entry = _meshMap[key];
            
            var va = entry.body.getAngularVelocity();
            var vl = entry.body.getLinearVelocity();
            
            entry.vAngular = [va.x(), va.y(), va.z()]
            entry.vLinear = [vl.x(), vl.y(), vl.z()]
        }
        
        _running = false;
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Update loop
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.update = function() {
        
        if(!_running) {
            
            cancelAnimationFrame(_animationId);

            return;
        }
        
        _animationId = requestAnimationFrame(
          _self.update);
        
        var dt = _stopWatch.getElapsedMs() * 0.002;
        
        dt = (dt > 0.5 ? 0.5 : dt);
        
        _world.stepSimulation(
          0.01, 10);
        
        for(var key in _meshMap) {
            
            updateMeshTransform(_meshMap[key]);
        }

        viewer.impl.sceneUpdated(true);
        
        _fps.tick();
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Reset simulation
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.reset = function() {
        
        for(var key in _meshMap) {
            
            var entry = _meshMap[key];
            
            entry.mesh.matrixWorld =
              entry.transform.clone();
            
            entry.vAngular = entry.vAngularInit;
            
            entry.vLinear = entry.vLinearInit;
        }

        viewer.impl.sceneUpdated(true);
        
        _started = false;
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Parses string to array: a1;a2;a3 -> [a1, a2, a3]
    //
    ///////////////////////////////////////////////////////////////////////////
    function parseArray(str, separator) {
        
        var array = str.split(separator);
        
        var result = [];
        
        array.forEach(function(element){
            
            result.push(parseFloat(element));
        });
        
        return result;
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Updates mesh transform according to physic body
    //
    ///////////////////////////////////////////////////////////////////////////
    function updateMeshTransform(entry) {

        var transform = entry.body.getCenterOfMassTransform();
        
        //mesh.quaternion = transform.getRotation();
        
        var position = transform.getOrigin();
        
        entry.fragProxy.position = new THREE.Vector3(
          position.x(),
          position.y(),
          position.z());

        entry.fragProxy.updateAnimTransform();
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Creates collision shape based on mesh vertices
    //
    ///////////////////////////////////////////////////////////////////////////
    function createCollisionShape(entry) {

        var geometry = entry.renderProxy.geometry;

        var attributes = geometry.attributes;
        
        var hull = new Ammo.btConvexHullShape();
        
        var vA = new THREE.Vector3();
        var vB = new THREE.Vector3();
        var vC = new THREE.Vector3();
        
        if (attributes.index !== undefined) {
            
            var indices = attributes.index.array || geometry.ib;
            var positions = geometry.vb ? geometry.vb : attributes.position.array;
            var stride = geometry.vb ? geometry.vbstride : 3;
            var offsets = geometry.offsets;
            
            if (!offsets || offsets.length === 0) {
                
                offsets = [{start: 0, count: indices.length, index: 0}];
            }
            
            for (var oi = 0, ol = offsets.length; oi < ol; ++oi) {
                
                var start = offsets[oi].start;
                var count = offsets[oi].count;
                var index = offsets[oi].index;
                
                for (var i = start, il = start + count; i < il; i += 3) {
                    
                    var a = index + indices[i];
                    var b = index + indices[i + 1];
                    var c = index + indices[i + 2];
                    
                    vA.fromArray(positions, a * stride);
                    vB.fromArray(positions, b * stride);
                    vC.fromArray(positions, c * stride);

                    hull.addPoint(new Ammo.btVector3(vA.x, vA.y, vA.z));
                    hull.addPoint(new Ammo.btVector3(vB.x, vB.y, vB.z));
                    hull.addPoint(new Ammo.btVector3(vC.x, vC.y, vC.z));
                }
            }
        }
        else {
            
            var positions = geometry.vb ? geometry.vb : attributes.position.array;
            var stride = geometry.vb ? geometry.vbstride : 3;
            
            for (var i = 0, j = 0, il = positions.length; i < il; i += 3, j += 9) {
                
                var a = i;
                var b = i + 1;
                var c = i + 2;
                
                vA.fromArray(positions, a * stride);
                vB.fromArray(positions, b * stride);
                vC.fromArray(positions, c * stride);

                hull.addPoint(new Ammo.btVector3(vA.x, vA.y, vA.z));
                hull.addPoint(new Ammo.btVector3(vB.x, vB.y, vB.z));
                hull.addPoint(new Ammo.btVector3(vC.x, vC.y, vC.z));
            }
        }
        
        return hull;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates physic rigid body from mesh
    //
    ///////////////////////////////////////////////////////////////////////////
    function createRigidBody(entry) {

        entry.fragProxy.getAnimTransform();

        var localInertia = new Ammo.btVector3(0, 0, 0);
        
        var shape = createCollisionShape(entry);
        
        shape.calculateLocalInertia(entry.mass, localInertia);
        
        var transform = new Ammo.btTransform;
        
        transform.setIdentity();

        var position = entry.fragProxy.position;

        var matrix = entry.renderProxy.matrixWorld;

        //var position = new THREE.Vector3();
        //position.setFromMatrixPosition(matrix);

        //console.log(p)

        transform.setOrigin(new Ammo.btVector3(
          position.x,
          position.y,
          position.z));
        
        var q = new THREE.Quaternion();
        //q.setFromRotationMatrix(matrix);

        transform.setRotation(new Ammo.btQuaternion(
          0,0,0,1
        ));
        
        var motionState = new Ammo.btDefaultMotionState(transform);

        var rbInfo = new Ammo.btRigidBodyConstructionInfo(
          entry.mass,
          motionState,
          shape,
          localInertia);
        
        var body = new Ammo.btRigidBody(rbInfo);

        body.setLinearVelocity(new Ammo.btVector3(0,0,0));

        //body.setLinearVelocity(
        //  new Ammo.btVector3(
        //    entry.vLinear[0],
        //    entry.vLinear[1],
        //    entry.vLinear[2]));
        
        body.setAngularVelocity(
          new Ammo.btVector3(
            entry.vAngular[0],
            entry.vAngular[1],
            entry.vAngular[2]));

        return body;
    }
    
    ///////////////////////////////////////////////////////////////////////////
    // get value for property name
    //
    ///////////////////////////////////////////////////////////////////////////
    function getPropertyValue (dbId, displayName, callback) {
          
          function _cb(result) {
              
              if (result.properties) {
                  
                  for (var i = 0; i < result.properties.length; i++) {
                      
                      var prop = result.properties[i];
                      
                      if (prop.displayName === displayName) {
                          
                          callback(prop.displayValue);
                          return;
                      }
                  }
                  
                  callback('undefined');
              }
          }
          
          viewer.getProperties(dbId, _cb);
      };
};

Autodesk.ADN.Viewing.Extension.Physics.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Physics.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Physics;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Physics',
  Autodesk.ADN.Viewing.Extension.Physics);

