///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.ScreenShotManager
// by Philippe Leefsma, May 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.ScreenShotManager = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _panelBaseId = newGUID();

  var _viewer = viewer;

  var _panel = null;

  var _this = this;

  /////////////////////////////////////////////////////////
  // load callback
  //
  //////////////////////////////////////////////////////////
  _this.load = function () {

    _panel = new Autodesk.ADN.Viewing.Extension.ScreenShotManager.Panel(
      _viewer.container,
      _panelBaseId);

    // creates controls if specified in
    // options: {createControls: true}
    if(options && options.createControls) {

      var ctrlGroup = getControlGroup();

      createControls(ctrlGroup);
    }
    else {

      _panel.setVisible(true);
    }

    console.log('Autodesk.ADN.Viewing.Extension.ScreenShotManager loaded');

    return true;
  };

  /////////////////////////////////////////////////////////
  // unload callback
  //
  /////////////////////////////////////////////////////////
  _this.unload = function () {

    _panel.setVisible(false);

    // remove controls if created
    if(options && options.createControls) {

      try {

        var toolbar = viewer.getToolbar(true);

        toolbar.removeControl(
          'Autodesk.ADN.ScreenShotManager.ControlGroup');
      }
      catch (ex) {

        $('#divScreenShotMngToolbar').remove();
      }
    }

    console.log('Autodesk.ADN.Viewing.Extension.ScreenShotManager unloaded');

    return true;
  };

  /////////////////////////////////////////////////////////
  // return control group or create if doesn't exist
  //
  /////////////////////////////////////////////////////////
  function getControlGroup() {

    var toolbar = null;

    try {
      toolbar = viewer.getToolbar(true);

      if(!toolbar) {
        toolbar = createDivToolbar();
      }
    }
    catch (ex) {
      toolbar = createDivToolbar();
    }

    var control = toolbar.getControl(
      'Autodesk.ADN.ScreenShotManager.ControlGroup');

    if(!control) {

      control = new Autodesk.Viewing.UI.ControlGroup(
        'Autodesk.ADN.ScreenShotManager.ControlGroup');

      toolbar.addControl(control);
    }

    return control;
  }

  /////////////////////////////////////////////////////////
  // create a div toolbar when Viewer3D used
  //
  /////////////////////////////////////////////////////////
  function createDivToolbar() {

    var toolbarDivHtml =
      '<div id="divScreenShotMngToolbar"> </div>';

    $(viewer.container).append(toolbarDivHtml);

    $('#divScreenShotMngToolbar').css({
      'bottom': '0%',
      'left': '50%',
      'z-index': '100',
      'position': 'absolute'
    });

    var toolbar = new Autodesk.Viewing.UI.ToolBar(true);

    $('#divScreenShotMngToolbar')[0].appendChild(
      toolbar.container);

    return toolbar;
  }

  /////////////////////////////////////////////////////////
  // creates controls for the extension
  //
  /////////////////////////////////////////////////////////
  function createControls(parentGroup) {

    var btn = createButton(
      'Autodesk.ADN.ScreenShotManager.Button',
      'glyphicon glyphicon-camera',
      'Manage Screenshots',
      onShowPanelClicked);

    parentGroup.addControl(btn);
  }

  /////////////////////////////////////////////////////////
  // show panel handler
  //
  /////////////////////////////////////////////////////////
  function onShowPanelClicked() {

    _panel.setVisible(true);
  }

  /////////////////////////////////////////////////////////
  // create button util
  //
  /////////////////////////////////////////////////////////
  function createButton(id, className, tooltip, handler) {

    var button = new Autodesk.Viewing.UI.Button(id);

    //button.icon.style.backgroundImage = imgUrl;
    button.icon.className = className;

    button.icon.style.fontSize = "24px";

    button.setToolTip(tooltip);

    button.onClick = handler;

    return button;
  }

  /////////////////////////////////////////////////////////
  // new GUID util
  //
  /////////////////////////////////////////////////////////
  function newGUID() {

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

  /////////////////////////////////////////////////////////
  // Panel implementation
  //
  /////////////////////////////////////////////////////////
  Autodesk.ADN.Viewing.Extension.ScreenShotManager.Panel = function(
    parentContainer,
    baseId)
  {
    this.content = document.createElement('div');

    this.content.id = baseId + 'PanelContentId';
    this.content.className = 'screenshot-manager-panel-content';

    Autodesk.Viewing.UI.DockingPanel.call(
      this,
      parentContainer,
      baseId,
      "Screenshot Manager",
      {shadow:true});

    this.container.style.right = "0px";
    this.container.style.top = "0px";

    this.container.style.width = "300px";
    this.container.style.height = "500px";

    this.container.style.resize = "auto";
  
    var html = [
      '<div class="screenshot-manager-panel-container">',
        '<div class="screenshot-manager-panel-controls-container">',
          '<div>',
            '<button class="btn btn-info" id="' + baseId + 'screenshotBtn">',
              '<span class="glyphicon glyphicon-camera" aria-hidden="true"></span> New Shot',
            '</button>',
            '<input class="screenshot-manager-panel-input" type="text" placeholder=" Width (px)" id="' + baseId + 'width">',
            '<input class="screenshot-manager-panel-input" type="text" placeholder=" Height (px)" id="' + baseId + 'height">',
          '</div>',
        '</div>',
        '<div id="' + baseId + 'PanelContainerId" class="list-group screenshot-manager-panel-list-container">',
        '</div>',
      '</div>'
    ].join('\n');

    $('#' + baseId + 'PanelContentId').html(html);

    ///////////////////////////////////////////////////////
    // Adds a new screenshot item
    //
    ///////////////////////////////////////////////////////
    function addShotItem(blobUrl, width, height) {

      var item = {
        id: newGUID(),
        imgId: newGUID(),
        linkId: newGUID(),
        deleteBtnId: newGUID(),
        name: new Date().toString('d/M/yyyy H:mm:ss')
      }

      var html = [

        '<div class="list-group-item screenshot-manager-panel-item" id="' + item.id + '">',
        '<div class="row">',
          '<div class="col-sm-4" style="width: 128px">',
            '<a id="' + item.linkId + '" href="' + blobUrl + '" download="' + item.name + '">',
              '<img id="' + item.imgId + '"width="128" height="128" src=' + blobUrl + '> </img>',
            '</a>',
          '</div>',
          '<div>',
            '<label> Width:' + width + ' px</label>',
            '<br>',
            '<label> Height:' + height + ' px</label>',
            '<br>',
            '<br>',
            '<button class="btn btn-sm btn-danger" id="' + item.deleteBtnId + '">',
              '<span class="glyphicon glyphicon-remove-sign" style="vertical-align:text-top"></span> Delete',
            '</button>',
          '</div>',
        '</div>',
        '</div>'

      ].join('\n');

      $('#' + baseId + 'PanelContainerId').append(html);

      $('#' + item.deleteBtnId).click(function() {

        $('#' + item.id).remove();

        // The URL.revokeObjectURL() static method releases
        // an existing object URL which was previously
        // created by calling window.URL.createObjectURL().
        // Call this method when you've finished using
        // a object URL, in order to let the browser know
        // it doesn't need to keep the reference to the file any longer.
        window.URL.revokeObjectURL(blobUrl);
      });
    }

    ///////////////////////////////////////////////////////
    // new screenshot button handler
    //
    ///////////////////////////////////////////////////////
    $('#' + baseId + 'screenshotBtn').click(function() {

      var $container = $(viewer.container);

      //validates width
      var width = parseInt($('#' + baseId + 'width').val());
      width = (isNaN(width) ? $container.width() : width);

      //validates height
      var height = parseInt($('#' + baseId + 'height').val());
      height = (isNaN(height) ? $container.height() : height);

      viewer.getScreenShot(
        width,
        height,
        function(newBlobURL){

          addShotItem(newBlobURL, width, height);
        });
    });
  };

  Autodesk.ADN.Viewing.Extension.ScreenShotManager.Panel.prototype = Object.create(
    Autodesk.Viewing.UI.DockingPanel.prototype);

  Autodesk.ADN.Viewing.Extension.ScreenShotManager.Panel.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.ScreenShotManager.Panel;

  Autodesk.ADN.Viewing.Extension.ScreenShotManager.Panel.prototype.initialize = function()
  {
    // Override DockingPanel initialize() to:
    // - create a standard title bar
    // - click anywhere on the panel to move

    this.title = this.createTitleBar(
      this.titleLabel ||
      this.container.id);

    this.closer = this.createCloseButton();

    this.container.appendChild(this.title);
    this.title.appendChild(this.closer);
    this.container.appendChild(this.content);

    this.initializeMoveHandlers(this.title);
    this.initializeCloseHandler(this.closer);
  };

  var css = [
  
    'div.screenshot-manager-panel-content {',
      'height: calc(100% - 40px);',
    '}',
  
    'div.screenshot-manager-panel-container {',
      'height: calc(100% - 40px);',
      'margin: 10px;',
    '}',
  
    'div.screenshot-manager-panel-controls-container {',
      'margin-bottom: 10px;',
    '}',
  
    'div.screenshot-manager-panel-list-container {',
      'height: calc(100% - 40px);',
      'overflow-y: auto;',
    '}',
  
    'div.screenshot-manager-panel-item {',
      'margin-left: 0;',
      'margin-right: 0;',
      'color: #FFFFFF;',
      'background-color: #3F4244;',
      'margin-bottom: 5px;',
      'border-radius: 4px;',
    '}',
  
    'div.screenshot-manager-panel-item:hover {',
      //'background-color: #5BC0DE;',
    '}',
  
    'label.screenshot-manager-panel-label {',
      'color: #FFFFFF;',
    '}',
  
    'input.screenshot-manager-panel-input {',
      'height: 30px;',
      'width: 75px;',
      'border-radius: 5px;',
    '}'

  ].join('\n');

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

  $('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.ScreenShotManager.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.ScreenShotManager.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.ScreenShotManager;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.ScreenShotManager',
  Autodesk.ADN.Viewing.Extension.ScreenShotManager);

