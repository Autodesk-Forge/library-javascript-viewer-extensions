///////////////////////////////////////////////////////////////////////////////
// ControlSelector viewer Extension
// by Philippe Leefsma, September 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Viewing.Extension");

Viewing.Extension.ControlSelector = function (viewer, options) {
  
  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _thisExtension = this;

  var _toolbarId = null;

  var _panel = null;

  /////////////////////////////////////////////
  // Extension load callback
  //
  /////////////////////////////////////////////
  _thisExtension.load = function () {

    var buttonId = guid();

    _panel = new Panel(
      viewer.container,
      guid(),
      buttonId);

    _toolbarId = createToolbar(buttonId);

    if(options.Lockr) {

      var ControlSelector = options.Lockr.get(
        options.storageKey);

      if (!ControlSelector) {

        ControlSelector = {
          controls: {}
        };

        options.Lockr.set(
          options.storageKey,
          ControlSelector);
      }

      loadFromStorage();
    }

    console.log('Viewing.Extension.ControlSelector loaded');
    
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
    
    console.log('Viewing.Extension.ControlSelector unloaded');
    
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
      'viewing-extension-ControlSelector-toolbar');

    var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
      'viewing-extension-ControlSelector-controlgroup');

    var button = createButton(
      buttonId,
      'glyphicon glyphicon-cog',
      'UI Settings',
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
      'position':'absolute'
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

    var ControlSelector = options.Lockr.get(
      options.storageKey);

    $('.adsk-control-group').each(function(){

      if(!$(this).hasClass('adsk-hidden') && this.id !==
        'viewing-extension-ControlSelector-controlgroup') {

        $(this).find('>.adsk-button').each(function(){

          if(ControlSelector.controls[this.id]) {

            var enabled = ControlSelector.controls[this.id].enabled;

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
      'left':'70px',
      'width': Math.min(w * 75/100, 250) + 'px',
      'height': Math.min(h * 75/100, 400) + 'px',
      'resize':'auto'
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
            'viewing-extension-ControlSelector-controlgroup') {

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

        if(options.Lockr) {

          var ControlSelector = options.Lockr.get(
            options.storageKey);

          if (!ControlSelector.controls[button.id]) {
            ControlSelector.controls[button.id] = {};
          }

          ControlSelector.controls[button.id].enabled = enabled;

          options.Lockr.set(
            options.storageKey,
            ControlSelector);
        }

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

Viewing.Extension.ControlSelector.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Viewing.Extension.ControlSelector.prototype.constructor =
  Viewing.Extension.ControlSelector;

Autodesk.Viewing.theExtensionManager.registerExtension(
  '_Viewing.Extension.ControlSelector',
  Viewing.Extension.ControlSelector);