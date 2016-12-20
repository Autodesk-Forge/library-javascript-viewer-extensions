///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Chart
// by Philippe Leefsma, July 2015
//
// Dependencies:
//
// Bootstrap: 3.3.5
// http://code.jquery.com/jquery-2.1.4.min.js
// https://rawgit.com/caolan/async/master/dist/async.min.js
// https://rawgit.com/nnnick/Chart.js/master/Chart.min.js
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Chart = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _self = this;

  var _elementIds = [];

  var _canvasId = null;

  var _components = null;

  var _graphType = 'pie';

  var _propName = 'label';

  ///////////////////////////////////////////////////////////////////////////
  // load callback
  //
  ///////////////////////////////////////////////////////////////////////////
  _self.load = function () {

    var dependencies = [
      "uploads/extensions/Autodesk.ADN.Viewing.Extension.Chart/Chart.min.js"
     ];

    require(dependencies, function() {

       getAllLeafComponents(function (components) {

         _components = components;

         _elementIds.push(createDropdownMenu(
           'Graph Type',
           {top: 50, left: 330},
           [{
             label: 'Pie',
             handler: function () {
               _graphType = 'pie';
               loadChartFromProperty(_graphType, _propName, _components);
             }
           },
             {
               label: 'Doughnut',
               handler: function () {
                 _graphType = 'doughnut';
                 loadChartFromProperty(_graphType, _propName, _components);
               }
             },
             {
             label: 'Polar',
             handler: function () {
               _graphType = 'polar';
               loadChartFromProperty(_graphType, _propName, _components);
             }
           }]
         ));

         getAvailableProperties(components, function (properties) {

           var menuItems = [];

           var labelIdx = 0;

           _propName = properties[0];

           properties.forEach(function (property, idx) {

             if(property === 'label') {
               labelIdx = idx;
               _propName = 'label';
             }

             menuItems.push({
               label: property,
               handler: function () {
                 _propName = property;
                 loadChartFromProperty(_graphType, _propName, _components);
               }
             })
           });

           _elementIds.push(createDropdownMenu(
             'Property',
             {top: 100, left: 330},
             menuItems,
             labelIdx));

           loadChartFromProperty(_graphType, _propName, _components);
         });
       });

       console.log('Autodesk.ADN.Viewing.Extension.Chart loaded');
    });

    return true;
  };

  ///////////////////////////////////////////////////////////////////////////
  // unload callback
  //
  ///////////////////////////////////////////////////////////////////////////
  _self.unload = function () {

    _elementIds.forEach(function(id) {

      $('#' + id).remove();
    });

    $('#' + _canvasId).remove();

    console.log('Autodesk.ADN.Viewing.Extension.Chart unloaded');

    return true;
  };

  ///////////////////////////////////////////////////////////////////////////
  // unload callback
  //
  ///////////////////////////////////////////////////////////////////////////
  function loadChartFromProperty(chartType, propName, components) {

    mapComponentsByPropName(propName, components, function(map){

      var data = [];

      for(var key in map) {

        data.push({
          value: map[key].length,
          color:"#" + Math.floor(Math.random() * 16777215).toString(16),
          highlight: "#5BC0DE",
          label: key
        });
      }

      $('#' + _canvasId).remove();

      _canvasId = guid();

      createOverlay(_canvasId);

      var canvas = $('#' + _canvasId)[0];

      var ctx = canvas.getContext("2d");

      var graph = null;

      switch(chartType) {

        case 'pie':
          graph = new Chart(ctx).Pie(data);
          break;

        case 'doughnut':
          graph = new Chart(ctx).Doughnut(data);
          break;

        case 'polar':
          graph = new Chart(ctx).PolarArea(data, {
            responsive:false
          });
          break;

        default :
          break;
      }

      canvas.onclick = function(event) {

        var segments = graph.getSegmentsAtEvent(event);

        if(segments.length) {

          var key = segments[0].label;

          viewer.fitToView(map[key]);
        }
      };

      canvas.onmousemove = function(event) {

        var segments = graph.getSegmentsAtEvent(event);

        if(segments.length) {

          var key = segments[0].label;

          viewer.isolate(map[key]);
        }
      }
    });
  }

  ///////////////////////////////////////////////////////////////////////////
  // Creates overlay canvas element
  //
  ///////////////////////////////////////////////////////////////////////////
  function createOverlay(canvasId) {

    var html = [
      '<canvas class="graph" id="' + canvasId + '" width="300" height="300">',
      '</canvas>',
    ].join('\n');

    $(viewer.container).append(html);
  }

  ///////////////////////////////////////////////////////////////////////////
  // Maps components by property
  //
  ///////////////////////////////////////////////////////////////////////////
  function mapComponentsByPropName(propName, components, onResult) {

    var componentsMap = {};

    async.each(components,

      function (component, callback) {

        getPropertyValue(component.dbId, propName, function (value) {

          if(propName === 'label') {
            value = value.split(':')[0];
          }

          if (!componentsMap[value]) {

            componentsMap[value] = [];
          }

          componentsMap[value].push(component.dbId);

          callback();
        });
      },
      function (err) {

        onResult(componentsMap);
      });
  }

  ///////////////////////////////////////////////////////////////////////////
  // Gets all existing properties from components list
  //
  ///////////////////////////////////////////////////////////////////////////
  function getAvailableProperties(components, onResult) {

    var propertiesMap = {};

    async.each(components,

      function (component, callback) {

        viewer.getProperties(component.dbId, function(result) {

          for (var i = 0; i < result.properties.length; i++) {

            var prop = result.properties[i];

            propertiesMap[prop.displayName] = {};
          }

          callback();
        });
      },
      function (err) {

        onResult(Object.keys(propertiesMap));
      });
  }

  ///////////////////////////////////////////////////////////////////////////
  // Get all leaf components
  //
  ///////////////////////////////////////////////////////////////////////////
  function getAllLeafComponents (callback) {

      function getLeafComponentsRec(parent) {

        var components = [];

        if (typeof parent.children !== "undefined") {

          var children = parent.children;

          for (var i = 0; i < children.length; i++) {

            var child = children[i];

            if (typeof child.children !== "undefined") {

              var subComps = getLeafComponentsRec(child);

              components.push.apply(components, subComps);
            }
            else {
              components.push(child);
            }
          }
        }

        return components;
      }

      viewer.getObjectTree(function (result) {

        var allLeafComponents = getLeafComponentsRec(result.root);

        callback(allLeafComponents);
      });
    };

  ///////////////////////////////////////////////////////////////////////////
  // Get property value from display name
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

  ///////////////////////////////////////////////////////////////////////////
  // Generates random guid
  //
  ///////////////////////////////////////////////////////////////////////////
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

  ///////////////////////////////////////////////////////////////////////////
  // Creates dropdown menu from input
  //
  ///////////////////////////////////////////////////////////////////////////
  function createDropdownMenu(title, pos, menuItems, selectedItemIdx) {

    var labelId = guid();

    var menuId = guid();

    var listId = guid();

    var html = [
      '<div id ="' + menuId + '" class="dropdown chart-dropdown">',
        '<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">',
          '<label id="' + labelId +'" style="font: normal 14px Times New Roman">' + title + '</label>',
        '<span class="caret"></span>',
        '</button>',
        '<ul id="' + listId + '"class="dropdown-menu scrollable-menu" >',
        '</ul>',
      '</div>'
      ].join('\n');

    $(viewer.container).append(html);

    $('#' + menuId).css({

      'top': pos.top + 'px',
      'left': pos.left + 'px'
    });

    $('#' + labelId).text(title + ': ' + menuItems[selectedItemIdx || 0].label);

    menuItems.forEach(function(menuItem){

      var itemId = guid();

      var itemHtml = '<li id="' + itemId + '"><a href="">' + menuItem.label + '</a></li>';

      $('#' + listId).append(itemHtml);

      $('#' + itemId).click(function(event) {

        event.preventDefault();

        menuItem.handler();

        $('#' + labelId).text(title + ': ' + menuItem.label);
      });
    });

    return menuId;
  }

  ///////////////////////////////////////////////////////////////////////////
  // dynamic css styles
  //
  ///////////////////////////////////////////////////////////////////////////
  var css = [

    'canvas.graph {',
      'top:10px;',
      'left:30px;',
      'width:300px;',
      'height:300px;',
      'position:absolute;',
      'overflow:hidden;',
    '}',

    'div.chart-dropdown {',
      'position: absolute;',
    '}',

    '.scrollable-menu {',
      'height: auto;',
      'max-height: 300px;',
      'overflow-x: hidden;',
      'overflow-y: scroll;',
    '}',

  ].join('\n');

  $('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.Chart.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Chart.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Chart;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Chart',
  Autodesk.ADN.Viewing.Extension.Chart);

