///////////////////////////////////////////////////////////////////////////////
// GeometrySelector viewer extension
// by Philippe Leefsma, August 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");
AutodeskNamespace("Autodesk.ADN.Viewing.Extension.GeometrySelector");


Autodesk.ADN.Viewing.Extension.GeometrySelector = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _self = this;

  var _panel = null;

  var _snapper = null;

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  _self.load = function () {

    var dependencies = [
      "uploads/extensions/Autodesk.ADN.Viewing.Extension.GeometrySelector/Autodesk.ADN.Viewing.Tool.Snapper.js"
    ];

    require(dependencies, function() {

      loadCSS();

      _snapper = new Autodesk.ADN.Viewing.Tool.Snapper(viewer);

      viewer.toolController.registerTool(_snapper);

      _snapper.setDetectRadius(0.15);

      logSnapEvents(true);

      _panel = new Autodesk.ADN.Viewing.Extension.GeometrySelector.Panel(
        viewer.container,
        guid(), 0, 0);

      _panel.setVisible(true);

      console.log('Autodesk.ADN.Viewing.Extension.GeometrySelector loaded');
    });

    return true;
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  _self.unload = function () {

    _panel.setVisible(false);

    _panel.uninitialize();

    console.log('Autodesk.ADN.Viewing.Extension.GeometrySelector unloaded');

    return true;
  }

  /////////////////////////////////////////////////////////
  // Generates random guid
  //
  /////////////////////////////////////////////////////////
  function guid() {

    var d = new Date().getTime();

    var guid = 'xxxx-xxxx-xxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
      });

    return guid;
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  function pointToString(point, fx) {

    return '[' +
      point.x.toFixed(fx) + ', ' +
      point.y.toFixed(fx) + ', ' +
      point.z.toFixed(fx) + ']';
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  function logSnapEvents(enabled) {

    if(enabled) {

      _snapper.onVertexSnapped(function (vertex) {

        _panel.log("Vertex: " + pointToString(vertex, 2));

        console.log(vertex);
      });

      _snapper.onEdgeSnapped(function (edge) {

        _panel.log("Edge: " +
        pointToString(edge.vertices[0], 1) + ', ' +
        pointToString(edge.vertices[1], 1));

        console.log(edge);
      });

      _snapper.onFaceSnapped(function (face) {

        _panel.log("Face: " +
          face.vertices.length + " vertices");

        console.log(face);
      });
    }
    else {

      _snapper.onVertexSnapped(null);
      _snapper.onEdgeSnapped(null);
      _snapper.onFaceSnapped(null);
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  function loadCSS() {

    var css = [

      'div.snap-panel-content {',
        'margin: 15px;',
      '}',

      'label.snap-panel {',
        'color: #FFFFFF;',
      '}',

      'textarea.snap-panel {',
        'width: calc(100% - 10px);',
        'resize: none;',
        'height: 150px;',
        'max-height: 150px;',
        'background-color: #989898;',
      '}',

      'button.snap-panel {',
        'width: 240px;',
      '}',

      'hr.snap-panel-spacer {',
        'margin: 0;',
        'height: 5px;',
        'visibility: hidden;',
      '}',

      'hr.snap-panel-splitter {',
        'margin-top: 15px;',
        'margin-left: 10px;',
        'margin-right: 20px;',
        'margin-bottom: 10px;',
      '}',

      'input.snap-panel {',
        'height: 20px;',
        'width: 100px;',
        'border-radius: 5px;',
        'text-align: right;',
      '}',

    ].join('\n');

    $('<style type="text/css">' + css + '</style>').appendTo('head');
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  Autodesk.ADN.Viewing.Extension.GeometrySelector.Panel = function(
    parentContainer,
    id, x, y) {

    var _thisPanel = this;

    this.content = document.createElement('div');

    Autodesk.Viewing.UI.DockingPanel.call(
      this,
      parentContainer,
      id,
      "Geometry Selector",
      {shadow: true});

    this.container.style.top = y + "px";
    this.container.style.left = x + "px";

    this.container.style.width = "300px";
    this.container.style.height = "635px";
    this.container.style.resize = "none";

    var detectId = guid();

    var cbVertexSnapId = guid();
    var cbEdgeSnapId = guid();
    var cbFaceSnapId = guid();
    var loggerId = guid();

    var btnClearId = guid();
    var btnPickVertexId = guid();
    var btnPickEdgeId = guid();
    var btnPickFaceId = guid();
    var btnPickAnyId = guid();

    var html = [

      '<div class="snap-panel-content">',

      '<label class="snap-panel">',
      ' Detection Radius: ' +
      '</label>',

      '&nbsp;&nbsp;&nbsp;&nbsp;',

      '<input class="snap-panel" type="text" id="' + detectId +'" value="0.1">',

      '<hr class="snap-panel-splitter"/>',

      '<label class="snap-panel">',
      ' Snap Filters: ' +
      '</label>',

      '<hr class="snap-panel-spacer"/>',

      '<label class="snap-panel">',
      '<input id="' + cbVertexSnapId + '" type="checkbox">',
      ' Vertex' +
      '</label>',

      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',

      '<label class="snap-panel">',
      '<input id="' + cbEdgeSnapId + '" type="checkbox">',
      ' Edge' +
      '</label>',

      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',

      '<label class="snap-panel">',
      '<input id="' + cbFaceSnapId + '" type="checkbox">',
      ' Face' +
      '</label>',

      '<hr class="snap-panel-splitter"/>',

      '<label class="snap-panel">',
      ' Pick Commands: ' +
      '</label>',

      '<hr class="snap-panel-spacer"/>',

      '<button class="btn btn-info snap-panel" id="'+ btnPickVertexId + '">',
      '<span class="glyphicon glyphicon-screenshot" aria-hidden="true"></span>' +
      '   Pick Vertex',
      '</button>',

      '<hr class="snap-panel-spacer"/>',

      '<button class="btn btn-info snap-panel" id="'+ btnPickEdgeId + '">',
      '<span class="glyphicon glyphicon-minus" aria-hidden="true"></span>' +
      '   Pick Edge',
      '</button>',

      '<hr class="snap-panel-spacer"/>',

      '<button class="btn btn-info snap-panel" id="'+ btnPickFaceId + '">',
      '<span class="glyphicon glyphicon-stop" aria-hidden="true"></span>' +
      '   Pick Face',
      '</button>',

      '<hr class="snap-panel-spacer"/>',

      '<button class="btn btn-info snap-panel" id="'+ btnPickAnyId + '">',
      '<span class="glyphicon glyphicon-screenshot" aria-hidden="true"></span> ' +
      '<span class="glyphicon glyphicon-minus" aria-hidden="true"></span>' +
      '<span class="glyphicon glyphicon-stop" aria-hidden="true"></span>' +
      '   Pick Any',
      '</button>',

      '<hr class="snap-panel-splitter"/>',

      '<label class="snap-panel">',
      ' Output: ' +
      '</label>',

      '<hr class="snap-panel-spacer"/>',

      '<textarea id="'+ loggerId + '" readonly="readonly" class="snap-panel">' +
      '</textarea>',

      '<hr class="snap-panel-spacer"/>',

      '<button class="btn btn-info snap-panel" id="'+ btnClearId + '">',
      '<span class="glyphicon glyphicon-refresh" aria-hidden="true"></span>' +
      '   Clear output',
      '</button>',

      '</div>',

    ].join('\n');

    $(_thisPanel.content).html(html);

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    _thisPanel.log = function(message) {

      var $text = $('#' + loggerId);

      var val = $text.val();

      $text.html(val + message + '&#10;');

      $text[0].scrollTop = $text[0].scrollHeight;
    }

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    function enableFilters(enabled) {

      $('#' + cbVertexSnapId).attr('disabled', !enabled);
      $('#' + cbEdgeSnapId).attr('disabled', !enabled);
      $('#' + cbFaceSnapId).attr('disabled', !enabled);
    }

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    $('#' + detectId).on('input',function(e) {

     if(!isNaN($('#' + detectId).val())) {

       var radius = parseFloat($('#' + detectId).val());

       _snapper.setDetectRadius(radius);

       console.log(radius);
     }
    });

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    $('#' + cbVertexSnapId).change(function () {

      if (this.checked) {

        _snapper.addSelectionFilter('vertex');
      }
      else {

        _snapper.removeSelectionFilter('vertex');
      }
    });

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    $('#' + cbEdgeSnapId).change(function () {

      if (this.checked) {

        _snapper.addSelectionFilter('edge');
      }
      else {

        _snapper.removeSelectionFilter('edge');
      }
    });

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    $('#' + cbFaceSnapId).change(function () {

      if (this.checked) {

        _snapper.addSelectionFilter('face');
      }
      else {

        _snapper.removeSelectionFilter('face');
        _snapper.onFaceSnapped(null);
      }
    });

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    $('#' + btnPickVertexId).click(function () {

      _panel.clearLog();

      _panel.log("Starting Pick Vertex ...")

      enableFilters(false);

      logSnapEvents(false);

      _snapper.clearSelectionFilter();

      _snapper.addSelectionFilter('vertex');
      _snapper.showTooltip(true, "Select vertex");

      _snapper.onGeometrySelected(function(vertex) {

        enableFilters(true);

        logSnapEvents(true);

        _snapper.showTooltip(false);

        _snapper.onGeometrySelected(null);

        _thisPanel.log("* Picked Vertex * : ");
        _thisPanel.log(pointToString(vertex, 2));
      });

      _snapper.onSelectionCancelled(function() {

        enableFilters(true);

        logSnapEvents(true);

        _snapper.showTooltip(false);

        _snapper.onGeometrySelected(null);

        _thisPanel.log("* Pick cancelled *");
      });
    });

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    $('#' + btnPickEdgeId).click(function () {

      _panel.clearLog();

      _panel.log("Starting Pick Edge ...")

      enableFilters(false);

      logSnapEvents(false);

      _snapper.clearSelectionFilter();

      _snapper.addSelectionFilter('edge');
      _snapper.showTooltip(true, "Select edge");

      _snapper.onGeometrySelected(function(edge) {

        enableFilters(true);

        logSnapEvents(true);

        _snapper.showTooltip(false);

        _snapper.onGeometrySelected(null);

        _thisPanel.log("* Picked Edge * : ");
        _thisPanel.log(
          pointToString(edge.vertices[0], 1) + ', ' +
          pointToString(edge.vertices[1], 1));
      });

      _snapper.onSelectionCancelled(function() {

        enableFilters(true);

        logSnapEvents(true);

        _snapper.showTooltip(false);

        _snapper.onGeometrySelected(null);

        _thisPanel.log("* Pick cancelled *");
      });
    });

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    $('#' + btnPickFaceId).click(function () {

      _panel.clearLog();

      _panel.log("Starting Pick Face ...")

      enableFilters(false);

      logSnapEvents(false);

      _snapper.clearSelectionFilter();

      _snapper.addSelectionFilter('face');
      _snapper.showTooltip(true, "Select face");

      _snapper.onGeometrySelected(function(face) {

        enableFilters(true);

        logSnapEvents(true);

        _snapper.onGeometrySelected(null);

        _snapper.showTooltip(false);

        _thisPanel.log("* Picked Face * : ");
        _thisPanel.log(face.vertices.length + ' vertices');
      });

      _snapper.onSelectionCancelled(function() {

        enableFilters(true);

        logSnapEvents(true);

        _snapper.showTooltip(false);

        _snapper.onGeometrySelected(null);

        _thisPanel.log("* Pick cancelled *");
      });
    });

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    $('#' + btnPickAnyId).click(function () {

      _panel.clearLog();

      _panel.log("Starting Pick Any ...")

      enableFilters(false);

      logSnapEvents(false);

      _snapper.clearSelectionFilter();
      _snapper.showTooltip(true, "Select geometry");

      _snapper.onGeometrySelected(function(geometry, type) {

        enableFilters(true);

        logSnapEvents(true);

        _snapper.showTooltip(false);

        _snapper.onGeometrySelected(null);

        _thisPanel.log("* Picked Geometry * : " + type);
      });

      _snapper.onSelectionCancelled(function() {

        enableFilters(true);

        logSnapEvents(true);

        _snapper.showTooltip(false);

        _snapper.onGeometrySelected(null);

        _thisPanel.log("* Pick cancelled *");
      });
    });

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    $('#' + btnClearId).click(function(){

      _thisPanel.clearLog();
    });

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    _thisPanel.clearLog = function () {

      $('#' + loggerId).html('');
    }
  };

  Autodesk.ADN.Viewing.Extension.GeometrySelector.Panel.prototype = Object.create(
    Autodesk.Viewing.UI.DockingPanel.prototype);

  Autodesk.ADN.Viewing.Extension.GeometrySelector.Panel.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.GeometrySelector.Panel;

  Autodesk.ADN.Viewing.Extension.GeometrySelector.Panel.prototype.initialize = function()
  {
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

  Autodesk.ADN.Viewing.Extension.GeometrySelector.Panel.prototype.setVisible = function(show)
  {
    Autodesk.Viewing.UI.DockingPanel.prototype.setVisible.call(this, show);

    this.isVisible = show;

    if(show) {

      viewer.toolController.activateTool(
        _snapper.getName());
    }
    else {

      viewer.toolController.deactivateTool(
        _snapper.getName());
    }
  };
};

Autodesk.ADN.Viewing.Extension.GeometrySelector.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.GeometrySelector.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.GeometrySelector;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.GeometrySelector',
  Autodesk.ADN.Viewing.Extension.GeometrySelector);
