/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.ModelLoader
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

import inspireTree from 'inspire-tree';
import './inspire-tree.css';
import './model-loader.css';

Autodesk.ADN.Viewing.Extension.ModelLoader = function (viewer, options) {
  
  Autodesk.Viewing.Extension.call(this, viewer, options);
  
  var _panel = null;

  ///////////////////////////////////////////////////////////////////
  // The model API used by this extension
  //
  ///////////////////////////////////////////////////////////////////
  var API = {

    /////////////////////////////////////////////////////////////////
    // Extracts model name (filename) from base64 URN
    //
    /////////////////////////////////////////////////////////////////
    getModelName: function(urn) {

      var fileId = decodeURIComponent(escape(window.atob(urn)));

      var filename = fileId.split('/')[1];

      var splits = filename.split('.');

      return filename.substring(0,
        filename.length - (splits[splits.length-1].length + 1));
    },

    /////////////////////////////////////////////////////////////////
    // Returns list of models available in the Gallery
    //
    /////////////////////////////////////////////////////////////////
    getGalleryModels: function() {

      return new Promise((resolve, reject)=> {

        $.get(options.apiUrl + '/models', (models)=> {

          resolve(models);
        });
      });
    },

    /////////////////////////////////////////////////////////////////
    // Returns list of models loaded in the current scene
    //
    /////////////////////////////////////////////////////////////////
    getLoadedModels: function() {

      return new Promise((resolve, reject)=> {

        resolve(viewer.impl.modelQueue().getModels());
      });
    },

    /////////////////////////////////////////////////////////////////
    // Returns Gallery token
    //
    /////////////////////////////////////////////////////////////////
    getToken: function() {

      return new Promise((resolve, reject)=> {

          $.get(options.apiUrl + '/lmv/token', (response)=> {

            resolve(response.access_token);
          });
        });
    },

    /////////////////////////////////////////////////////////////////
    // Returns viewable path from URN (needs matching token)
    //
    /////////////////////////////////////////////////////////////////
    getViewablePath: function(token, urn) {

      return new Promise((resolve, reject)=> {

        try {

          Autodesk.Viewing.Initializer({
            accessToken: token
            }, ()=> {

          Autodesk.Viewing.Document.load(
            'urn:' + urn,
            (document)=> {

              var rootItem = document.getRootItem();

              var geometryItems3d = Autodesk.Viewing.Document.
                getSubItemsWithProperties(
                rootItem, {
                  'type': 'geometry',
                  'role': '3d' },
                true);

              var geometryItems2d = Autodesk.Viewing.Document.
                getSubItemsWithProperties(
                rootItem, {
                  'type': 'geometry',
                  'role': '2d' },
                true);

              var got2d = (geometryItems2d && geometryItems2d.length > 0);
              var got3d = (geometryItems3d && geometryItems3d.length > 0);

              if(got2d || got3d) {

                var pathCollection = [];

                geometryItems2d.forEach((item)=>{

                  pathCollection.push(document.getViewablePath(item));
                });

                geometryItems3d.forEach((item)=>{

                  pathCollection.push(document.getViewablePath(item));
                });

                return resolve(pathCollection);
              }
              else {

                return reject('no viewable content')
              }
            },
            (err)=> {

              console.log('Error loading document... ');

              //Autodesk.Viewing.ErrorCode

              switch(err){

                case 1: //UNKNOWN_FAILURE
                  console.log('An unknown failure has occurred.');
                  break;

                case 2: //BAD_DATA
                  console.log('Bad data (corrupted or malformed) ' +
                    'was encountered.');
                  break;

                case 3: //NETWORK_FAILURE
                  console.log('A network failure was encountered.');
                  break;

                case 4: //NETWORK_ACCESS_DENIED
                  console.log('Access was denied to a ' +
                    'network resource (HTTP 403).');
                  break;

                case 5: //NETWORK_FILE_NOT_FOUND
                  console.log('A network resource could not ' +
                    'be found (HTTP 404).');
                  break;

                case 6: //NETWORK_SERVER_ERROR
                  console.log('A server error was returned when ' +
                    'accessing a network resource (HTTP 5xx).');
                  break;

                case 7: //NETWORK_UNHANDLED_RESPONSE_CODE
                  console.log('An unhandled response code was ' +
                    'returned when accessing a network resource ' +
                    '(HTTP everything else).');
                  break;

                case 8: //BROWSER_WEBGL_NOT_SUPPORTED
                  console.log('Browser error: WebGL is not ' +
                    'supported by the current browser.');
                  break;

                case 9: //BAD_DATA_NO_VIEWABLE_CONTENT
                  console.log('There is nothing viewable in ' +
                    'the fetched document.');
                  break;

                case 10: //BROWSER_WEBGL_DISABLED
                  console.log('Browser error: WebGL is ' +
                    'supported, but not enabled.');
                  break;

                case 11: //RTC_ERROR
                  console.log('Collaboration server error');
                  break;
              }
            });
          });
        }
        catch(ex){

          return reject(ex);
        }
      });
    },

    /////////////////////////////////////////////////////////////////
    // Loads model into current scene
    //
    /////////////////////////////////////////////////////////////////
    loadModel: function(path, opts) {

      return new Promise(async(resolve, reject)=> {

        function _onGeometryLoaded(event) {

          viewer.removeEventListener(
            Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
            _onGeometryLoaded);

          return resolve(event.model);
        }

        viewer.addEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          _onGeometryLoaded);

        viewer.loadModel(path, opts, ()=> {

          },
          (errorCode, errorMessage, statusCode, statusText)=> {

            viewer.removeEventListener(
              Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
              _onGeometryLoaded);

            return reject({
              errorCode: errorCode,
              errorMessage: errorMessage,
              statusCode: statusCode,
              statusText: statusText
            });
          });
        });
      },

    /////////////////////////////////////////////////////////////////
    // Sets model as "current"
    //
    /////////////////////////////////////////////////////////////////
    setCurrentModel: function(model) {

      return new Promise((resolve, reject)=> {

        viewer.model = model;

        var propertyPanel = viewer.getPropertyPanel(true);

        propertyPanel.currentModel = model;

        model.getObjectTree((instanceTree) =>{

          viewer.modelstructure.setModel(instanceTree);

          return resolve();
        });
      });
    },

    /////////////////////////////////////////////////////////////////
    // Fits model to view
    //
    /////////////////////////////////////////////////////////////////
    fitModelToView: function(model) {

      return new Promise((resolve, reject)=> {

        model.getObjectTree((instanceTree) =>{

          viewer.fitToView([instanceTree.rootId]);
        });
      });
    },

    /////////////////////////////////////////////////////////////////
    // Unloads model from current scene
    //
    /////////////////////////////////////////////////////////////////
    unloadModel: function(model) {

      return new Promise(async(resolve, reject)=>{

        viewer.impl.unloadModel(model);

        viewer.impl.sceneUpdated(true);

        return resolve();
      });
    },

    /////////////////////////////////////////////////////////////////
    // Applies transform to specific model
    //
    /////////////////////////////////////////////////////////////////
    transformModel: function(model, transform) {

      function _transformFragProxy(fragId){

        var fragProxy = viewer.impl.getFragmentProxy(
          model,
          fragId);

        fragProxy.getAnimTransform();

        fragProxy.position = transform.translation;

        fragProxy.scale = transform.scale;

        //Not a standard three.js quaternion
        fragProxy.quaternion._x = transform.rotation.x;
        fragProxy.quaternion._y = transform.rotation.y;
        fragProxy.quaternion._z = transform.rotation.z;
        fragProxy.quaternion._w = transform.rotation.w;

        fragProxy.updateAnimTransform();
      }

      return new Promise(async(resolve, reject)=>{

        var fragCount = model.getFragmentList().
          fragments.fragId2dbId.length;

        //fragIds range from 0 to fragCount-1
        for(var fragId=0; fragId<fragCount; ++fragId){

          _transformFragProxy(fragId);
        }

        return resolve();
      });
    },

    /////////////////////////////////////////////////////////////////
    // Hides node (if nodeOff = true completely hides the node)
    //
    /////////////////////////////////////////////////////////////////
    hideNode: function(model, dbIds, nodeOff=false) {

      return new Promise((resolve, reject)=> {

        dbIds = Array.isArray(dbIds) ? dbIds : [dbIds];

        model.getObjectTree((instanceTree)=> {

          var vm = new Autodesk.Viewing.Private.VisibilityManager(
            viewer.impl,
            viewer.model);

          dbIds.forEach((dbId)=> {

            var node = instanceTree.dbIdToNode[dbId];

            vm.hide(node);
            vm.setNodeOff(node, nodeOff);
          });

          return resolve();
        });
      });
    },

    /////////////////////////////////////////////////////////////////
    // Shows node
    //
    /////////////////////////////////////////////////////////////////
    showNode: function(model, dbIds) {

      return new Promise((resolve, reject)=> {

        dbIds = Array.isArray(dbIds) ? dbIds : [dbIds];

        model.getObjectTree((instanceTree)=> {

          var vm = new Autodesk.Viewing.Private.VisibilityManager(
            viewer.impl,
            viewer.model);

          dbIds.forEach((dbId)=> {

            var node = instanceTree.dbIdToNode[dbId];

            vm.setNodeOff(node, false);
            vm.show(node);
          });

          return resolve();
        });
      });
    }
  }

  /////////////////////////////////////////////////////////////////
  // Extension load callback
  //
  /////////////////////////////////////////////////////////////////
  this.load = function() {

    //set name of original model
    viewer.model.name = options.model.name;

    var button = createButton(guid(),
      'glyphicon glyphicon-list',
      'Model Loader', ()=>{

        _panel.toggleVisibility();
      });

    var viewerToolbar = viewer.getToolbar(true);

    var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
      'ModelLoader');

    ctrlGroup.addControl(button, {index:1});

    viewerToolbar.addControl(ctrlGroup);

    _panel = new ModelLoaderPanel(
      viewer.container,
      guid(),
      button.container,
      inspireTree);

    console.log('Autodesk.ADN.Viewing.Extension.ModelLoader loaded');

    return true;
  }
  
  /////////////////////////////////////////////////////////////////
  //  Extension unload callback
  //
  /////////////////////////////////////////////////////////////////
  this.unload = function () {

    if(_panel) {

      _panel.setVisible(false);

      _panel = null;

      var viewerToolbar = viewer.getToolbar(true);

      viewerToolbar.removeControl(
        'ModelLoader');
    }

    console.log('Autodesk.ADN.Viewing.Extension.ModelLoader unloaded');
    
    return true;
  }

  /////////////////////////////////////////////////////////////////
  // toolbar button
  //
  /////////////////////////////////////////////////////////////////
  function createButton(id, className, tooltip, handler) {

    var button = new Autodesk.Viewing.UI.Button(id);

    button.icon.style.fontSize = "24px";

    button.icon.className = className;

    button.setToolTip(tooltip);

    button.onClick = handler;

    return button;
  }
  
  /////////////////////////////////////////////////////////////////
  // Generates random guid to use as DOM id
  //
  /////////////////////////////////////////////////////////////////
  function guid() {
    
    var d = new Date().getTime();
    
    var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });
    
    return guid;
  }
  
  /////////////////////////////////////////////////////////////////
  // The Model Loader Panel
  //
  /////////////////////////////////////////////////////////////////
  var ModelLoaderPanel = function(
    parentContainer,
    panelId,
    btnElement,
    InspireTree) {

    /////////////////////////////////////////////////////////////////
    // Base class constructor
    //
    /////////////////////////////////////////////////////////////////
    Autodesk.Viewing.UI.DockingPanel.call(
      this,
      parentContainer,
      panelId,
      'Model Loader',
      {shadow: true});

    /////////////////////////////////////////////////////////////////
    // "Private" ModelLoaderPanel members
    //
    /////////////////////////////////////////////////////////////////
    var _thisPanel = this;

    var _isVisible = false;

    var _isMinimized = false;

    var _loadedModelsTree = null;

    var _galleryFilteredNodes = [];

    /////////////////////////////////////////////////////////////////
    // Initializes the panel
    //
    /////////////////////////////////////////////////////////////////
    async function initialize() {

      _thisPanel.content = document.createElement('div');

      $(_thisPanel.container).addClass('model-loader');

      $(_thisPanel.container).append(generateHtml(panelId));

      //$('[data-toggle="tooltip"]').tooltip();

      reloadTree();

      $(`#${panelId}-load-btn`).click(
        onLoad);

      $(`#${panelId}-load-gallery-btn`).click(
        onLoadGallery);

      $(`#${panelId}-transform-btn`).click(
        onTransform);

      $(`#${panelId}-clear-btn`).click(
        onClear);

      viewer.addEventListener(
        Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
        onAggregateSelectionChanged);

      // Loads gallery models tree

      $('.model-loader .tree-container.gallery').append(
        '<div class="model-loader-gallery-tree"></div>'
      );

      var rootNode = {
        type: 'root_node',
        text: 'Gallery Models',
        children: []
      };

      var galleryModels = await API.getGalleryModels();

      galleryModels.forEach((model)=>{

        // filters out .dwg's

        var fileId = decodeURIComponent(
          escape(window.atob(model.urn)));

        if(!fileId.endsWith('.dwg')) {

          rootNode.children.push({
            type: 'model_node',
            text: model.name,
            model: model,
            children: []
          });
        }
      });

      var tree = new InspireTree({
        target: '.model-loader-gallery-tree',
        data: [rootNode]
      });

      tree.on('node.dblclick', async(event, node)=> {

        if(node.type == 'model_node') {

        await loadGalleryNode(node);

          reloadTree();
        }
      });

      $(`#${panelId}-search`).on('keyup', (e)=> {

        var matches = tree.search(e.target.value);

        _galleryFilteredNodes = matches || [];
      });
    }

    /////////////////////////////////////////////////////////////
    // Custom html content of the panel
    //
    /////////////////////////////////////////////////////////////
    function generateHtml(id) {

      return `

      <div class="container">

        <button class="btn btn-info btn-load"
                id="${id}-load-btn"
                data-placement="bottom"
                data-toggle="tooltip"
                title="Load from URN using provided token">
          <span class="glyphicon glyphicon-save btn-span"
                aria-hidden="true" style="top:1px;">
          </span>
          Load
        </button>

        <input id="${id}-token" type="text"
          class="input token"
          placeholder=" Token...">

        <input id="${id}-urn" type="text"
          class="input urn"
          placeholder=" Model URN ...">

        <hr class="v-spacer">

        <div>
          <span class="text-span">
            Scale:
          </span>

          <hr class="v-spacer">

          <input id="${id}-Sx" type="text"
            class="input numeric"
            placeholder="  x (1.0)">

          <input id="${id}-Sy" type="text"
            class="input numeric"
            placeholder="  y (1.0)">

          <input id="${id}-Sz" type="text"
            class="input numeric"
            placeholder="  z (1.0)">

          <hr class="v-spacer">

          <span class="text-span">
            Translation:
          </span>

          <hr class="v-spacer">

          <input id="${id}-Tx" type="text"
            class="input numeric"
            placeholder="  x (0.0)">

          <input id="${id}-Ty" type="text"
            class="input numeric"
            placeholder="  y (0.0)">

          <input id="${id}-Tz" type="text"
            class="input numeric"
            placeholder="  z (0.0)">
        </div>

        <hr class="v-spacer">

        <div>
          <span class="text-span">
            Rotation (deg):
          </span>

          <hr class="v-spacer">

          <input id="${id}-Rx" type="text"
            class="input numeric"
            placeholder="  x (0.0)">

          <input id="${id}-Ry" type="text"
            class="input numeric"
            placeholder="  y (0.0)">

          <input id="${id}-Rz" type="text"
            class="input numeric"
            placeholder="  z (0.0)">

          <hr class="v-spacer-large">

          <button class="btn btn-info btn-transform"
                  id="${id}-transform-btn"
                  data-placement="bottom"
                  data-toggle="tooltip"
                  title="Transform selected loaded models">
            <span class="glyphicon glyphicon-random btn-span"
                  aria-hidden="true">
            </span>
             Transform Selection ...
          </button>

          <button class="btn btn-info btn-clear"
                  id="${id}-clear-btn"
                  data-placement="bottom"
                  data-toggle="tooltip"
                  title="Clear transform fields">
            <span class="glyphicon glyphicon-remove btn-span"
                  aria-hidden="true">
            </span>
             Clear
          </button>

        </div>

        <hr class="v-spacer-large">

        <input id="${id}-search" type="text"
            class="input search"
            placeholder=" Search Gallery Models...">

        <button class="btn btn-info btn-load-gallery"
                id="${id}-load-gallery-btn"
                data-placement="bottom"
                data-toggle="tooltip"
                title="Load filtered gallery models">
          <span class="glyphicon glyphicon-import btn-span"
                aria-hidden="true">
          </span>
           Load
        </button>

        <hr class="v-spacer-large">

        <div class="all-trees-container">

          <div class="tree-container gallery">
          </div>

          <hr class="tree-spacer">

          <div class="tree-container loaded">
          </div>

        </div>

      </div>`;
    }

    /////////////////////////////////////////////////////////////////
    // Aggregate SelectionChanged handler
    //
    /////////////////////////////////////////////////////////////////
    async function onAggregateSelectionChanged(event) {

      if(event.selections && event.selections.length){

        var selection = event.selections[0];

        var model = selection.model;

        await API.setCurrentModel(model);

        var nodeId = selection.dbIdArray[0];

        setPropertyPanelNode(nodeId);
      }
      //no components selected -> display properties of root
      else {

        viewer.model.getObjectTree((instanceTree) =>{

          setPropertyPanelNode(instanceTree.rootId);
        });
      }
    }

    function setPropertyPanelNode(nodeId) {

      viewer.getProperties(nodeId, (result)=>{

        if(result.properties) {

          var propertyPanel = viewer.getPropertyPanel(true);

          propertyPanel.setNodeProperties(nodeId);

          propertyPanel.setProperties(result.properties);
        }
      });
    }

    /////////////////////////////////////////////////////////////////
    // Load button handler
    //
    /////////////////////////////////////////////////////////////////
    async function onLoad(event) {
      
      event.preventDefault();
      
      var urn = $(`#${panelId}-urn`).val();

      var token = $(`#${panelId}-token`).val();
      
      if(!urn.length) {

        alert('Invalid model URN...');
        return;
      }

      token = (token.length ? token : await API.getToken());

      var model = await loadFromURN(token, urn);

      model.name = API.getModelName(urn);

      reloadTree();
    }

    /////////////////////////////////////////////////////////////////
    // Loads model from URN
    //
    /////////////////////////////////////////////////////////////////
    async function loadFromURN(token, urn) {

      var loadOptions = {
        placementTransform: buildTransformMatrix()
      }

      var pathCollection = await API.getViewablePath(
        token, urn);

      var model = await API.loadModel(
        pathCollection[0],
        loadOptions);

      return model;
    }

    /////////////////////////////////////////////////////////////////
    // Transform button handler
    //
    /////////////////////////////////////////////////////////////////
    function onTransform(event) {

      var root = _loadedModelsTree.nodes()[0];

      var selectedNodes = [];

      root.children.recurseDown((node)=> {

        if (node.selected() && node.type == 'model_node') {

          selectedNodes.push(node);
        }
      });

      var transform = {
        translation: getTranslation(),
        rotation: getRotation(),
        scale: getScale()
      };

      selectedNodes.forEach(async(node)=>{

        await API.transformModel(
          node.model,
          transform);

        viewer.impl.sceneUpdated(true);
      });
    }

    /////////////////////////////////////////////////////////////////
    // Clear Transform button handler
    //
    /////////////////////////////////////////////////////////////////
    function onClear(event) {

      $(`#${panelId}-Sx`).val('');
      $(`#${panelId}-Sy`).val('');
      $(`#${panelId}-Sz`).val('');

      $(`#${panelId}-Tx`).val('');
      $(`#${panelId}-Ty`).val('');
      $(`#${panelId}-Tz`).val('');

      $(`#${panelId}-Rx`).val('');
      $(`#${panelId}-Ry`).val('');
      $(`#${panelId}-Rz`).val('');
    }

    /////////////////////////////////////////////////////////////////
    // Load from gallery button handler
    //
    /////////////////////////////////////////////////////////////////
    async function onLoadGallery(event) {

      event.preventDefault();

      var promises = [];

      _galleryFilteredNodes.forEach((node)=>{

        promises.push(loadGalleryNode(node))
      });

      Promise.all(promises).then(()=> {

        reloadTree();
      });
    }

    /////////////////////////////////////////////////////////////////
    // Loads a gallery node model
    //
    /////////////////////////////////////////////////////////////////
    async function loadGalleryNode(node) {

      // load model from local resource if available
      if(node.model.viewablePath &&
        node.model.viewablePath.length) {

        var loadOptions = {
          placementTransform: buildTransformMatrix()
        }

        var model = await API.loadModel(
          node.model.viewablePath[0].path,
          loadOptions);

        model.name = node.model.name;
      }
      // load from View & Data server
      else {

        var token = await API.getToken();

        var model = await loadFromURN(
          token,
          node.model.urn);

        model.name = node.model.name;
      }
    }

    /////////////////////////////////////////////////////////////////
    // Reloads model tree
    //
    /////////////////////////////////////////////////////////////////
    async function reloadTree() {

      $('.model-loader-tree').remove();

      $('.model-loader .tree-container.loaded').append(
        '<div class="model-loader-tree"></div>'
      );

      var rootNode = {
        type: 'root_node',
        text: 'Loaded Models',
        children: []
      };

      var models = await API.getLoadedModels();

      models.forEach((model)=>{

        rootNode.children.push({
          type: 'model_node',
          text: `${model.name} [Id: ${model.id}]`,
          model: model,
          children: []
        });
      });

      var tree = new InspireTree({
        target: '.model-loader-tree',
        data: [rootNode],
        contextMenu: [{
          text: 'Set as Current',
          handler: (event, node, closer)=> {

            closer();
            API.setCurrentModel(node.model);
          }
        },{
          text: 'Unload Model',
          handler: async(event, node, closer)=> {

            closer();

            await API.unloadModel(node.model);

            reloadTree();
          }
        }]
      });

      tree.on('node.dblclick', async(event, node)=> {

        if(node.type == 'model_node'){

          await API.setCurrentModel(node.model);

          await API.fitModelToView(node.model);
        }
      });

      //expand root
      tree.nodes()[0].expand();

      _loadedModelsTree = tree;
    }

    /////////////////////////////////////////////////////////////
    // Gets input transform
    //
    /////////////////////////////////////////////////////////////
    function getScale() {

      var x = parseFloat($(`#${panelId}-Sx`).val());
      var y = parseFloat($(`#${panelId}-Sy`).val());
      var z = parseFloat($(`#${panelId}-Sz`).val());

      x = isNaN(x) ? 1.0 : x;
      y = isNaN(y) ? 1.0 : y;
      z = isNaN(z) ? 1.0 : z;

      return new THREE.Vector3(x, y, z);
    }

    function getTranslation() {

      var x = parseFloat($(`#${panelId}-Tx`).val());
      var y = parseFloat($(`#${panelId}-Ty`).val());
      var z = parseFloat($(`#${panelId}-Tz`).val());

      x = isNaN(x) ? 0.0 : x;
      y = isNaN(y) ? 0.0 : y;
      z = isNaN(z) ? 0.0 : z;

      return new THREE.Vector3(x, y, z);
    }

    function getRotation() {

      var x = parseFloat($(`#${panelId}-Rx`).val());
      var y = parseFloat($(`#${panelId}-Ry`).val());
      var z = parseFloat($(`#${panelId}-Rz`).val());

      x = isNaN(x) ? 0.0 : x;
      y = isNaN(y) ? 0.0 : y;
      z = isNaN(z) ? 0.0 : z;

      var euler = new THREE.Euler(
        x * Math.PI/180,
        y * Math.PI/180,
        z * Math.PI/180,
        'XYZ');

      var q = new THREE.Quaternion();

      q.setFromEuler(euler);

      return q;
    }

    /////////////////////////////////////////////////////////////
    // Builds transform matrix
    //
    /////////////////////////////////////////////////////////////
    function buildTransformMatrix() {

      var t = getTranslation();
      var r = getRotation();
      var s = getScale();

      var m = new THREE.Matrix4();

      m.compose(t, r, s);

      return m;
    }
    
    /////////////////////////////////////////////////////////////
    // setVisible override
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.setVisible = function(show) {

      _isVisible = show;

      btnElement.classList.toggle('active');

      Autodesk.Viewing.UI.DockingPanel.prototype.
        setVisible.call(this, show);
    }

    /////////////////////////////////////////////////////////////
    // Toggles panel visibility
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.toggleVisibility = function() {

      _panel.setVisible(!_isVisible);
    }
    
    /////////////////////////////////////////////////////////////
    // initialize override
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.initialize = function() {
      
      this.title = this.createTitleBar(
        this.titleLabel ||
        this.container.id);
      
      this.closer = this.createCloseButton();
      
      this.container.appendChild(this.title);
      this.title.appendChild(this.closer);
      this.container.appendChild(this.content);
      
      this.initializeMoveHandlers(this.title);
      this.initializeCloseHandler(this.closer);
    }
    
    /////////////////////////////////////////////////////////////
    // onTitleDoubleClick override
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.onTitleDoubleClick = function (event) {
      
      _isMinimized = !_isMinimized;
      
      if(_isMinimized) {
        
        $(_thisPanel.container).addClass(
          'minimized');
      }
      else {
        $(_thisPanel.container).removeClass(
          'minimized');
      }
    }

    // Initializes the panel
    initialize();
  }
  
  /////////////////////////////////////////////////////////////
  // Set up JS inheritance
  //
  /////////////////////////////////////////////////////////////
  ModelLoaderPanel.prototype = Object.create(
    Autodesk.Viewing.UI.DockingPanel.prototype);

  ModelLoaderPanel.prototype.constructor = ModelLoaderPanel;
};

Autodesk.ADN.Viewing.Extension.ModelLoader.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.ModelLoader.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.ModelLoader;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.ModelLoader',
  Autodesk.ADN.Viewing.Extension.ModelLoader);