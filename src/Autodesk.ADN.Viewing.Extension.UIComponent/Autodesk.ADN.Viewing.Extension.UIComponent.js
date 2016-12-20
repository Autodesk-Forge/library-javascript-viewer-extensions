///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.UIComponent
// by Philippe Leefsma, May 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.UIComponent = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _panel = null;

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  this.load = function () {

    var ctrlGroup = getControlGroup();

    createControls(ctrlGroup);

    _panel = new Autodesk.ADN.Viewing.Extension.UIComponent.Panel(
      viewer.container,
      newGUID());

    console.log('Autodesk.ADN.Viewing.Extension.UIComponent loaded');

    return true;
  };

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  this.unload = function () {

    try {

      var toolbar = viewer.getToolbar(true);
  
      toolbar.removeControl(
        'Autodesk.ADN.UIComponent.ControlGroup');
    }
    catch (ex) {
      $('#divUIComponentToolbar').remove();
    }

    console.log('Autodesk.ADN.Viewing.Extension.UIComponent unloaded');

    return true;
  };

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
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
      'Autodesk.ADN.UIComponent.ControlGroup');

    if(!control) {

      control = new Autodesk.Viewing.UI.ControlGroup(
        'Autodesk.ADN.UIComponent.ControlGroup');

      toolbar.addControl(control);
    }

    return control;
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function createDivToolbar() {

    var toolbarDivHtml =
      '<div id="divUIComponentToolbar"> </div>';

    $(viewer.container).append(toolbarDivHtml);

    $('#divUIComponentToolbar').css({
      'bottom': '0%',
      'left': '50%',
      'z-index': '100',
      'position': 'absolute'
    });

    var toolbar = new Autodesk.Viewing.UI.ToolBar(true);

    $('#divUIComponentToolbar')[0].appendChild(
      toolbar.container);

    return toolbar;
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function createControls(parentGroup) {

    var btn = createButton(
      'Autodesk.ADN.UIComponent.Button.Show',
      'glyphicon glyphicon-list',
      'Show Panel',
      onShowPanel);

    parentGroup.addControl(btn);
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function onShowPanel() {

    _panel.setVisible(true);
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function createButton(id, className, tooltip, handler) {

    var button = new Autodesk.Viewing.UI.Button(id);

    button.icon.style.fontSize = "24px";

    button.icon.className = className;

    button.setToolTip(tooltip);

    button.onClick = handler;

    return button;
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
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

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  Autodesk.ADN.Viewing.Extension.UIComponent.Panel = function(
    parentContainer,
    baseId) {

    this.content = document.createElement('div');

    this.content.id = baseId + 'PanelContentId';
    this.content.className = 'uicomponent-panel-content';

    Autodesk.Viewing.UI.DockingPanel.call(
      this,
      parentContainer,
      baseId,
      "UI Component Demo",
      {shadow: true});

    this.container.style.right = "0px";
    this.container.style.top = "0px";

    this.container.style.width = "380px";
    this.container.style.height = "400px";

    this.container.style.resize = "auto";

    var html = [
      '<div class="uicomponent-panel-container">',
        '<div class="uicomponent-panel-controls-container">',
          '<div>',
            '<button class="btn btn-info" id="' + baseId + 'clearBtn">',
              '<span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span> Clear',
            '</button>',
            '<button class="btn btn-info" id="' + baseId + 'addBtn">',
              '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add Item',
            '</button>',
            '<input class="uicomponent-panel-input" type="text" placeholder=" Name (default: Date)" id="' + baseId + 'itemName">',
          '</div>',
          '<br>',
        '</div>',
        '<div id="' + baseId + 'PanelContainerId" class="list-group uicomponent-panel-list-container">',
        '</div>',
      '</div>'
    ].join('\n');

    $('#' + baseId + 'PanelContentId').html(html);

    /////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////
    $('#' + baseId + 'addBtn').click(function(){

      var name =  $('#' + baseId + 'itemName').val();

      name = name.length ? name :
        new Date().toString('d/M/yyyy H:mm:ss');

      var item = {
        name: name,
        id: newGUID(),
        handler: function (){alert('Item: ' + name + ' clicked!')}
      }

      var html = [

        '<div class="list-group-item uicomponent-panel-item" id="' + item.id + '">',
          name,
        '</div>'

      ].join('\n');

      $('#' + baseId + 'PanelContainerId').append(html);

      $('#' + item.id).click(function () {
        item.handler();
      });
    });

    /////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////
    $('#' + baseId + 'clearBtn').click(function(){

      $('#' + baseId + 'PanelContainerId > div').each(
        function (idx, child) {
          $(child).remove();
        }
      )
    });
  };

  Autodesk.ADN.Viewing.Extension.UIComponent.Panel.prototype = Object.create(
    Autodesk.Viewing.UI.DockingPanel.prototype);

  Autodesk.ADN.Viewing.Extension.UIComponent.Panel.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.UIComponent.Panel;

  Autodesk.ADN.Viewing.Extension.UIComponent.Panel.prototype.initialize = function()
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

    'div.uicomponent-panel-content {',
      'height: calc(100% - 5px);',
    '}',

    'div.uicomponent-panel-container {',
      'height: calc(100% - 60px);',
      'margin: 10px;',
    '}',

    'div.uicomponent-panel-controls-container {',
      'margin-bottom: 10px;',
    '}',

    'div.uicomponent-panel-list-container {',
      'height: calc(100% - 60px);',
      'overflow-y: auto;',
    '}',

    'div.uicomponent-panel-item {',
      'margin-left: 0;',
      'margin-right: 0;',
      'color: #FFFFFF;',
      'background-color: #3F4244;',
      'margin-bottom: 5px;',
      'border-radius: 4px;',
    '}',

    'div.uicomponent-panel-item:hover {',
      'background-color: #5BC0DE;',
    '}',

    'label.uicomponent-panel-label {',
      'color: #FFFFFF;',
    '}',

    'input.uicomponent-panel-input {',
      'height: 30px;',
      'width: 150px;',
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

Autodesk.ADN.Viewing.Extension.UIComponent.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.UIComponent.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.UIComponent;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.UIComponent',
  Autodesk.ADN.Viewing.Extension.UIComponent);

