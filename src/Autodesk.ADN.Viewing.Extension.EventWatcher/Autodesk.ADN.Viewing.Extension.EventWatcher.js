///////////////////////////////////////////////////////////////////////////////
// EventWatcher viewer extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.EventWatcher = function (viewer, options) {
  
  Autodesk.Viewing.Extension.call(this, viewer, options);
  
  var _self = this;
  
  var _panel = null;

  var events = [
    {
      id: Autodesk.Viewing.CAMERA_CHANGE_EVENT,
      name: 'Autodesk.Viewing.CAMERA_CHANGE_EVENT'
    },
    {
      id: Autodesk.Viewing.HIDE_EVENT,
      name: 'Autodesk.Viewing.HIDE_EVENT'
    },
    {
      id: Autodesk.Viewing.ISOLATE_EVENT,
      name: 'Autodesk.Viewing.ISOLATE_EVENT'
    },
    {
      id: Autodesk.Viewing.HIGHLIGHT_EVENT,
      name: 'Autodesk.Viewing.HIGHLIGHT_EVENT'
    },
    {
      id: Autodesk.Viewing.RENDER_OPTION_CHANGED_EVENT,
      name: 'Autodesk.Viewing.RENDER_OPTION_CHANGED_EVENT'
    },
    {
      id: Autodesk.Viewing.RESET_EVENT,
      name: 'Autodesk.Viewing.RESET_EVENT'
    },
    {
      id: Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      name: 'Autodesk.Viewing.SELECTION_CHANGED_EVENT'
    },
    {
      id: Autodesk.Viewing.SHOW_EVENT,
      name: 'Autodesk.Viewing.SHOW_EVENT'
    },
    {
      id: Autodesk.Viewing.TOOL_CHANGE_EVENT,
      name: 'Autodesk.Viewing.TOOL_CHANGE_EVENT'
    },
    {
      id: Autodesk.Viewing.CUTPLANES_CHANGE_EVENT,
      name: 'Autodesk.Viewing.CUTPLANES_CHANGE_EVENT'
    },
    {
      id: Autodesk.Viewing.LAYER_VISIBILITY_CHANGED_EVENT,
      name: 'Autodesk.Viewing.LAYER_VISIBILITY_CHANGED_EVENT'
    },
    {
      id: Autodesk.Viewing.EXPLODE_CHANGE_EVENT,
      name: 'Autodesk.Viewing.EXPLODE_CHANGE_EVENT'
    },
    {
      id: Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
      name: 'Autodesk.Viewing.TOOLBAR_CREATED_EVENT'
    },
    {
      id: Autodesk.Viewing.ESCAPE_EVENT,
      name: 'Autodesk.Viewing.ESCAPE_EVENT'
    },
    {
      id: Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      name: 'Autodesk.Viewing.GEOMETRY_LOADED_EVENT'
    },
    {
      id: Autodesk.Viewing.PROGRESS_UPDATE_EVENT,
      name: 'Autodesk.Viewing.PROGRESS_UPDATE_EVENT'
    },
    {
      id: Autodesk.Viewing.NAVIGATION_MODE_CHANGED_EVENT,
      name: 'Autodesk.Viewing.NAVIGATION_MODE_CHANGED_EVENT'
    },
    {
      id: Autodesk.Viewing.FULLSCREEN_MODE_EVENT,
      name: 'Autodesk.Viewing.FULLSCREEN_MODE_EVENT'
    },
    {
      id: Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT,
      name: 'Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT'
    },
    {
      id: Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
      name: 'Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT'
    },
    {
      id: Autodesk.Viewing.OBJECT_TREE_UNAVAILABLE_EVENT,
      name: 'Autodesk.Viewing.OBJECT_TREE_UNAVAILABLE_EVENT'
    },
    {
      id: Autodesk.Viewing.VIEWER_RESIZE_EVENT,
      name: 'Autodesk.Viewing.VIEWER_RESIZE_EVENT'
    },
    {
      id: Autodesk.Viewing.ANIMATION_READY_EVENT,
      name: 'Autodesk.Viewing.ANIMATION_READY_EVENT'
    },
    {
      id: Autodesk.Viewing.VIEWER_STATE_RESTORED_EVENT,
      name: 'Autodesk.Viewing.VIEWER_STATE_RESTORED_EVENT'
    },
    {
      id: Autodesk.Viewing.VIEWER_UNINITIALIZED,
      name: 'Autodesk.Viewing.VIEWER_UNINITIALIZED'
    }
  ]

  /////////////////////////////////////////////////////////////////
  // Extension load callback
  //
  /////////////////////////////////////////////////////////////////
  _self.load = function () {
    
    _panel = new Panel(
      viewer.container,
      guid());
    
    var path = "uploads/extensions/Autodesk.ADN.Viewing.Extension.EventWatcher";
    
    var dependencies = [

      //https://github.com/yesmeck/jquery-jsonview
      path + "/jquery.jsonview.js",

      //https://github.com/WebReflection/circular-json
      path + "/circular-json.min.js"
    ];
    
    require(dependencies, function() {
      
      $('<link rel="stylesheet" type="text/css" href="' + path + '/jquery.jsonview.css"/>').appendTo('head');
      
      _panel.setVisible(true);

      //dependency on lodash for _.sortBy
      _panel.loadEvents(_.sortBy(events, 'name'));

      console.log('Autodesk.ADN.Viewing.Extension.EventWatcher loaded');
    });
    
    return true;
  }
  
  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  _self.unload = function () {

    _panel.setVisible(false);

    _panel.unloadEvents(events);
    
    console.log('Autodesk.ADN.Viewing.Extension.EventWatcher unloaded');
    
    return true;
  }
  
  /////////////////////////////////////////////////////////////////
  //
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
  //
  //
  /////////////////////////////////////////////////////////////////
  var Panel = function(
    parentContainer, id) {
    
    var _thisPanel = this;
    
    _thisPanel.content = document.createElement('div');
    
    Autodesk.Viewing.UI.DockingPanel.call(
      this,
      parentContainer,
      id,
      'Event Watcher',
      {shadow:true});
  
    $(_thisPanel.container).addClass('event-watcher-container');
    
    /////////////////////////////////////////////////////////////////
    // Custom html
    //
    /////////////////////////////////////////////////////////////////
    var html = [
      
      '<div class="event-watcher-main">',

        '<div id="' + id + '-controls" class="event-watcher-controls">' +

        '</div>',

        '<div id="' + id + '-logger" class="event-watcher-jsonview"> ',
        '</div>',

        '<button class="btn btn-info event-watcher-clear-btn" id="'+ id + '-clearBtn">',
        '<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>' +
        '   Clear output',
        '</button>',
      
      '</div>'
    ];

    $(_thisPanel.container).append(html.join('\n'));

    $('#' + id + '-clearBtn').click(function(){

      clearLog();
    });

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    _thisPanel.loadEvents = function(events) {

      events.forEach(function(event){

        addEvent(event);
      });
    }

    _thisPanel.unloadEvents = function(events) {

      events.forEach(function(event){

        viewer.removeEventListener(
          event.id,
          event.handler);
      });
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    function addEvent(event) {

      console.log(event.name)

      var cbId = guid();

      var ctrlHtml = [

        '<input id="' + cbId + '" type="checkbox">',
        '<label class="event-watcher-label">',
          event.name,
        '</label>',
        '<br>'
      ];

      $('#' + id + '-controls').append(ctrlHtml.join('\n'));

      event.handler = function(e) {

        //replace target for perf
        e.target = 'viewer';

        appendJSON({
          'name': event.name,
          'event': e
        });
      };

      $('#' + cbId).change(function () {

        if (this.checked) {

          viewer.addEventListener(
            event.id,
            event.handler);
        }
        else {

          viewer.removeEventListener(
            event.id,
            event.handler);
        }
      });
    }

    /////////////////////////////////////////////////////////////////
    // setVisible override (not used in that sample)
    //
    /////////////////////////////////////////////////////////////////
    _thisPanel.setVisible = function(show) {
      
      Autodesk.Viewing.UI.DockingPanel.prototype.
        setVisible.call(this, show);
    }

    /////////////////////////////////////////////////////////////////
    // append json view element
    //
    /////////////////////////////////////////////////////////////////
    function appendJSON(json) {

      try {
        console.log(json);

        var jsonViewId = guid();

        var jsonHtml = [

          '<div id="' + jsonViewId + '">',
          '</div>'
        ];

        var $logger = $('#' + id + '-logger');

        $logger.append(
          jsonHtml.join('\n'));

        $('#' + jsonViewId).JSONView(
          CircularJSON.stringify(json, null, 2), {collapsed: true});

        //scroll down to last element
        $logger[0].scrollTop = $logger[0].scrollHeight;
      }
      catch(ex) {

        console.log(ex);
      }
    }

    /////////////////////////////////////////////////////////////////
    // Clear all log elements
    //
    /////////////////////////////////////////////////////////////////
    function clearLog() {

      $('#' + id + '-logger > div').each(
        function (idx, child) {
          $(child).remove();
        });
    }
    
    /////////////////////////////////////////////////////////////////
    // initialize override
    //
    /////////////////////////////////////////////////////////////////
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
    
    /////////////////////////////////////////////////////////////////
    // onTitleDoubleClick override
    //
    /////////////////////////////////////////////////////////////////
    var _isMinimized = false;
    
    _thisPanel.onTitleDoubleClick = function (event) {
      
      _isMinimized = !_isMinimized;
      
      if(_isMinimized) {
        
        $(_thisPanel.container).addClass(
          'event-watcher-minimized');
      }
      else {
        $(_thisPanel.container).removeClass(
          'event-watcher-minimized');
      }
    };
  };
  
  /////////////////////////////////////////////////////////////////
  // Set up JS inheritance
  //
  /////////////////////////////////////////////////////////////////
  Panel.prototype = Object.create(
    Autodesk.Viewing.UI.DockingPanel.prototype);
  
  Panel.prototype.constructor = Panel;
  
  /////////////////////////////////////////////////////////////////
  // Add needed CSS
  //
  /////////////////////////////////////////////////////////////////
  var css = [

    'div.event-watcher-container {',
      'top: 0px;',
      'left: 0px;',
      'width: 490px;',
      'height: 500px;',
      'resize: auto;',
    '}',

    'div.event-watcher-minimized {',
      'height: 34px;',
      'min-height: 34px',
    '}',

    'div.event-watcher-main {',
      'margin: 2px;',
      'height: calc(100% - 50px);',
    '}',

    'div.event-watcher-controls {',
      'margin: 10px;',
      'height: 170px;',
      'overflow: auto;',
    '}',

    'div.event-watcher-jsonview {',
      'margin: 10px;',
      'background-color: #E0E0E0;',
      'overflow-y: auto;',
      'height: calc(100% - 225px);',
    '}',

    'button.event-watcher-clear-btn {',
      'margin-left: 10px;',
      'width: calc(100% - 45px);',
    '}',

    'label.event-watcher-label {',
      'color: whitesmoke;',
    '}'
  
  ].join('\n');
  
  $('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.EventWatcher.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.EventWatcher.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.EventWatcher;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.EventWatcher',
  Autodesk.ADN.Viewing.Extension.EventWatcher);

