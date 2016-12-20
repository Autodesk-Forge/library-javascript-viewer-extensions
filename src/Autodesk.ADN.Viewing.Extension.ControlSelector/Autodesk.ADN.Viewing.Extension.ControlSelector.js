///////////////////////////////////////////////////////////////////////////////
// Control Selector viewer Extension
// by Philippe Leefsma, September 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.ControlSelector = function (viewer, options) {
  
  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _thisExtension = this;

  var _toolbarId = null;

  var _panel = null;

  /////////////////////////////////////////////
  // Extension load callback
  //
  /////////////////////////////////////////////
  _thisExtension.load = function () {

    var uiSettings = Lockr.get('uiSettings');

    if(!uiSettings) {

      uiSettings = {
        controls: {}
      };

      Lockr.set('uiSettings', uiSettings);
    }

    var buttonId = guid();

    _panel = new Panel(
      viewer.container,
      guid(),
      buttonId);

    _toolbarId = createToolbar(buttonId);

    loadFromStorage();

    console.log('Autodesk.ADN.Viewing.Extension.ControlSelector loaded');
    
    return true;
  };
  
  /////////////////////////////////////////////
  //  Extension unload callback
  //
  /////////////////////////////////////////////
  _thisExtension.unload = function () {

    if(_panel) {
      _panel.setVisible(false);
    }

    $('#' + _toolbarId).remove();
    
    console.log('Autodesk.ADN.Viewing.Extension.ControlSelector unloaded');
    
    return true;
  };

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
  function createToolbar(buttonId) {

    var toolbar = new Autodesk.Viewing.UI.ToolBar(
      'adn-viewing-extension-uisettings-toolbar');

    var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
      'adn-viewing-extension-uisettings-controlgroup');

    var button = createButton(
      buttonId,
      'fa fa-gear',
      'Select Controls',
      togglePanel);

    ctrlGroup.addControl(button);

    toolbar.addControl(ctrlGroup);

    var toolbarId = guid();

    var html = '<div id=' + toolbarId + '> </div>';

    $(viewer.container).append(html);

    var $toolbar = $('#' + toolbarId);

    $toolbar.css({
      'top': '70px',
      'left': '0px',
      'position':'absolute',
      'z-index': '1'
    });

    $toolbar[0].appendChild(toolbar.container);

    return toolbarId;
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function togglePanel() {

    _panel.toggleVisible();
  }
  
  /////////////////////////////////////////////
  // Generates random guid to use as DOM id
  //
  /////////////////////////////////////////////
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
  };

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function loadFromStorage() {

    var uiSettings = Lockr.get('uiSettings');

    $('.adsk-control-group').each(function(){

      if(!$(this).hasClass('adsk-hidden') && this.id !==
        'adn-viewing-extension-uisettings-controlgroup') {

        $(this).find('>.adsk-button').each(function(){

          if(uiSettings.controls[this.id]) {

            var enabled = uiSettings.controls[this.id].enabled;

            $(this).css({
              'display':(enabled ? 'block' : 'none')
            });
          }
        });
      }
    });
  }

  /////////////////////////////////////////////
  // The demo Panel
  //
  /////////////////////////////////////////////
  var Panel = function(
    parentContainer, id, controlId) {
    
    var _thisPanel = this;

    Autodesk.Viewing.UI.DockingPanel.call(
      this,
      parentContainer,
      id,
      'Select Visible Controls',
      {shadow:true});

    var w = viewer.container.clientWidth;
    var h = viewer.container.clientHeight;

    $(_thisPanel.container).css({
      'top':'5px',
      'left':'65px',
      'width': Math.min(w * 75/100, 250) + 'px',
      'height': Math.min(h * 80/100, 400) + 'px',
      'resize':'auto',
      'z-index':'10'
    });

    /////////////////////////////////////////////
    // Custom html
    //
    /////////////////////////////////////////////
    var html = [

      '<div class="ui-settings-panel-content">',
        '<ul id="' + id + '-item-list" class="ui-settings-item-list">',
        '</ul>',
      '<div>'
    ];
    
    $(_thisPanel.container).append(html.join('\n'));

    /////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////
    function loadButtons() {

      $('.adsk-control-group').each(function(){

        if(!$(this).hasClass('adsk-hidden') && this.id !==
            'adn-viewing-extension-uisettings-controlgroup') {

          $(this).find('>.adsk-button').each(function(){

            addItem(this);
          });
        }
      });
    }

    /////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////
    function clearButtons() {

      $('#' + id + '-item-list > li').each(
        function (idx, child) {
          $(child).remove();
        });
    }

    /////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////
    function addItem(button) {

      var itemId = guid();

      var $button = $(button);

      var text = $button.find('>.adsk-control-tooltip').text().split('(')[0];

      var item = [

        '<li class="list-group-item ui-settings-item" id="' + itemId + '">',
            text,
        '</li>',

      ].join('\n');

      $('#' + id + '-item-list').append(item);

      if($button.css('display') !== 'none')
        $('#' + itemId).addClass('enabled');


      $('#' + itemId).click(function (e) {

        e.preventDefault();

        var $this = $(this);

        var enabled = $this.hasClass('enabled');

        enabled = !enabled;

        $button.css({
          'display':(enabled ? 'block' : 'none')
        });

        if(enabled) {
          $this.addClass('enabled');
        }
        else {
          $this.removeClass('enabled');
        }

        var uiSettings = Lockr.get('uiSettings');

        if(!uiSettings.controls[button.id]) {
          uiSettings.controls[button.id] = {};
        }

        uiSettings.controls[button.id].enabled = enabled;

        Lockr.set('uiSettings', uiSettings);

        return false;
      });
    }

    /////////////////////////////////////////////
    // toggle panel visibility
    //
    /////////////////////////////////////////////
    var _visible = false;

    _thisPanel.toggleVisible = function() {

      _visible = !_visible;

      _thisPanel.setVisible(_visible);
    }

    /////////////////////////////////////////////
    // setVisible override (not used in that sample)
    //
    /////////////////////////////////////////////
    _thisPanel.setVisible = function(show) {

      _visible = show;

      Autodesk.Viewing.UI.DockingPanel.prototype.
        setVisible.call(this, show);

      var $button = $('#' + controlId);

      if(show) {
        loadButtons();
        $button.addClass('active');
        $button.removeClass('inactive');
      }
      else {
        clearButtons();
        $button.addClass('inactive');
        $button.removeClass('active');
      }
    }
    
    /////////////////////////////////////////////
    // initialize override
    //
    /////////////////////////////////////////////
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
    };
    
    /////////////////////////////////////////////
    // onTitleDoubleClick override
    //
    /////////////////////////////////////////////
    var _isMinimized = false;
    
    _thisPanel.onTitleDoubleClick = function (event) {
      
      _isMinimized = !_isMinimized;
      
      if(_isMinimized) {
        
        $(_thisPanel.container).css({
          'height': '34px',
          'min-height': '34px'
        });
      }
      else {
        $(_thisPanel.container).css({
          'height': '80%'
        });
      }
    };
  };
  
  /////////////////////////////////////////////
  // Set up JS inheritance
  //
  /////////////////////////////////////////////
  Panel.prototype = Object.create(
    Autodesk.Viewing.UI.DockingPanel.prototype);
  
  Panel.prototype.constructor = Panel;
  
  /////////////////////////////////////////////
  // Add needed CSS
  //
  /////////////////////////////////////////////
  var css = [

    'div.ui-settings-panel-content{',
      'height: calc(100% - 40px);',
      'overflow-y: scroll;',
    '}',

    'ul.ui-settings-item-list{',
      'padding: 0;',
      'margin:5px',
    '}',
    
    'li.ui-settings-item{',
      'color: #FFFFFF;',
      'background-color: #3F4244;',
      'list-style-type: none;',
      'margin-bottom:  5px;',
      'border-radius:4px',
    '}',

    'li.ui-settings-item:hover{',
      'cursor: pointer;',
      'color: #FFFFFF;',
      'background-color: #5BC0DE;',
    '}',

    'li.ui-settings-item.enabled {',
      'color: #000000;',
      'background-color: #00CC00;',
    '}',

  ].join('\n');
  
  $('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.ControlSelector.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.ControlSelector.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.ControlSelector;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.ControlSelector',
  Autodesk.ADN.Viewing.Extension.ControlSelector);