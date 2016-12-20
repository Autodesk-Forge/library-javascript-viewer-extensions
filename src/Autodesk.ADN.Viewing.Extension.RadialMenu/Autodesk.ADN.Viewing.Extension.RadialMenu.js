/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.RadialMenu
// by Philippe Leefsma, November 2015
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.RadialMenu = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  class ScreenPointTracker {

    constructor(onChange) {

      this.onChange = onChange;

      //used to bind 'this' inside event hander
      this.cameraChangedHandler =
        (event)=>{this.onCameraChanged(event)};
    }

    /////////////////////////////////////////////////////////////////
    // set screenpoint
    //
    /////////////////////////////////////////////////////////////////
    setScreenPoint(screenPoint) {

      var n = this.normalize({
        x: screenPoint.x + document.body.scrollLeft,
        y: screenPoint.y + document.body.scrollTop
      });

      this.worldPoint = viewer.utilities.getHitPoint(
        n.x, n.y);
    }

    /////////////////////////////////////////////////////////////////
    // Activate tracking
    //
    /////////////////////////////////////////////////////////////////
    activate() {

      viewer.addEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.cameraChangedHandler);
    }

    /////////////////////////////////////////////////////////////////
    // Deactivate tracking
    //
    /////////////////////////////////////////////////////////////////
    deactivate() {

      viewer.removeEventListener(
        Autodesk.Viewing.CAMERA_CHANGE_EVENT,
        this.cameraChangedHandler);
    }

    /////////////////////////////////////////////////////////////////
    // camera change callback
    //
    /////////////////////////////////////////////////////////////////
    onCameraChanged(event) {

      var screenPoint = this.worldToScreen(
        this.worldPoint,
        viewer.navigation.getCamera());

      this.onChange(screenPoint);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Normalize screen coordinates
    //
    ///////////////////////////////////////////////////////////////////////////
    normalize(screenPoint) {

      var viewport = viewer.navigation.getScreenViewport();

      return {
        x: (screenPoint.x - viewport.left) / viewport.width,
        y: (screenPoint.y - viewport.top) / viewport.height
      };
    }

    ///////////////////////////////////////////////////////////////////////////
    // world -> screen coords conversion
    //
    ///////////////////////////////////////////////////////////////////////////
    worldToScreen(worldPoint, camera) {

      var p = new THREE.Vector4();

      p.x = worldPoint.x;
      p.y = worldPoint.y;
      p.z = worldPoint.z;
      p.w = 1;

      p.applyMatrix4(camera.matrixWorldInverse);
      p.applyMatrix4(camera.projectionMatrix);

      // Don't want to mirror values with negative z (behind camera)
      // if camera is inside the bounding box,
      // better to throw markers to the screen sides.
      if (p.w > 0)
      {
        p.x /= p.w;
        p.y /= p.w;
        p.z /= p.w;
      }

      // This one is multiplying by width/2 and â€“height/2,
      // and offsetting by canvas location
      var point = viewer.impl.viewportToClient(p.x, p.y);

      // snap to the center of the pixel
      point.x = Math.floor(point.x) + 0.5;
      point.y = Math.floor(point.y) + 0.5;

      return point;
    }
  }

  /////////////////////////////////////////////////////////////////
  // Extension members
  //
  /////////////////////////////////////////////////////////////////
  var _$menu = null;

  var _tracker = null;

  var _dbIdArray = null;

  var _container = viewer.container;

  /////////////////////////////////////////////////////////////////
  // Extension load callback
  //
  /////////////////////////////////////////////////////////////////
  this.load = function () {

    _$menu = createRadialMenu(
      [
        {
          text: 'Item 1',
          class: 'fa fa-play',
          onClick: function(label) {
            alert('Item 1!');
          }
        },
        {
          text: 'Item 2',
          class: 'fa fa-stop',
          onClick: function(label) {
            alert('Item 2!');
          }
        },
        {
          text: 'Item 3',
          class: 'fa fa-pause',
          onClick: function(label) {
            alert('Item 3!');
          }
        },
        {
          text: 'Item 4',
          class: 'fa fa-random',
          onClick: function(label) {
            alert('Item 4!');
          }
        },
        {
          text: 'Item 5',
          class: 'fa fa-backward',
          onClick: function(label) {
            alert('Item 5!');
          }
        },
        {
          text: 'Item 6',
          class: 'fa fa-forward',
          onClick: function(label) {
            alert('Item 6!');
          }
        },
      ],
      _container,
      'img/favicon.png');

    viewer.addEventListener(
      Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      onItemSelected);

    _tracker = new ScreenPointTracker(
      onScreenPointChanged);

    console.log('Autodesk.ADN.Viewing.Extension.RadialMenu loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  //  Extension unload callback
  //
  /////////////////////////////////////////////////////////////////
  this.unload = function () {

    _$menu.remove();

    viewer.removeEventListener(
      Autodesk.Viewing.SELECTION_CHANGED_EVENT,
      onItemSelected);

    console.log('Autodesk.ADN.Viewing.Extension.RadialMenu unloaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // mouse click handler: stores screenpoint coordinates
  //
  /////////////////////////////////////////////////////////////////
  function onMouseClick(event) {

    $(_container).unbind(
      "click",
      onMouseClick);

    if(_dbIdArray.length) {

      var screenPoint = {
        x: event.clientX,
        y: event.clientY
      };

      var offset = getClientOffset(
        _container);

      _$menu.css({
        'left': screenPoint.x - offset.x - 32 * 0.5,
        'top': screenPoint.y - offset.y - 32 * 0.5,
        'display':'block'
      });

      _tracker.setScreenPoint(screenPoint);

      _tracker.activate();
    }
    else {

      _$menu.hideMenu();

      _tracker.deactivate();
    }
  }

  /////////////////////////////////////////////////////////////////
  // item selected callback
  //
  /////////////////////////////////////////////////////////////////
  function onItemSelected(event) {

    _dbIdArray = event.dbIdArray;

    $(_container).bind(
      "click",
      onMouseClick);
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  function onScreenPointChanged(screenPoint) {

    _$menu.css({
      'left': screenPoint.x - 32 * 0.5,
      'top': screenPoint.y - 32 * 0.5
    });
  }

  /////////////////////////////////////////////////////////////////
  // client offset
  //
  /////////////////////////////////////////////////////////////////
  function getClientOffset(element) {

    var x = 0;
    var y = 0;

    while (element) {

      x += element.offsetLeft -
      element.scrollLeft +
      element.clientLeft;

      y += element.offsetTop -
      element.scrollTop +
      element.clientTop;

      element = element.offsetParent;
    }

    return { x: x, y: y };
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
  // Creates dom elements and animation logic for radial menu
  //
  /////////////////////////////////////////////////////////////////
  function createRadialMenu(menuItems, parent, imgSrc) {

    var $parent = $(parent);

    var containerId = guid();

    var selectorId = guid();

    var triggerId = guid();

    var itemsId = guid();

    var html = [

      '<div class="menu-container" id="' + containerId + '">',
        '<div class="menu-selector" id="' + selectorId + '" style="display:none;">',
          '<ul id="' + itemsId + '">',
          '</ul>',
          '<button id="' + triggerId + '">' +
          '<img width="32" height="32" src="' + imgSrc + '"/>',
          '</button>',
        '</div>',
      '</div>'
    ];

    $parent.append(html.join('\n'));

    var $selector = $('#' + selectorId);

    function rotate (li, d) {

      $({ d: -360 }).animate (
        {
          d: d
        },
        {
          step: function (now) {
            $(li)
              .css ({ transform: 'rotate(' + now + 'deg)' })
              .find ('label')
              .css ({ transform: 'rotate(' + (-now) + 'deg)' }) ;
        },
        duration: 10
      }) ;
    }

    function animateItems() {

      var li = $selector.find('li');

      var deg = $selector.hasClass ('half') ? 180 / (li.length - 1) : 360 / li.length;

      for ( var i =0 ; i < li.length ; i++ ) {

        var d = $selector.hasClass('half') ? (i * deg) - 90 : i * deg;

        $selector.hasClass('open') ? rotate (li[i], d) : rotate (li[i], -360) ;
      }
    }

    var _isOpen = false;

    function hideMenu() {

      $selector.removeClass('open');

      animateItems();

      setTimeout(function() {
        $selector.css({'display': 'none'});
      }, (_isOpen ? 800 : 0));

      _isOpen = false;
    }

    $('#' + triggerId).click(function(event) {

      $selector.toggleClass('open');

      animateItems();

      _isOpen = !_isOpen;
    });

    var $container= $('#' + containerId);

    $container.css({
      'background-color':'transparent',
      'height': $parent.outerHeight(),
      'width': $parent.outerWidth(),
      'pointer-events':'none',
      'position':'absolute',
      'left': '0px',
      'top': '0px'
    });

    var $items = $('#' + itemsId);

    menuItems.forEach(function(menuItem) {

      var itemId = guid();

      var itemHtml = [

        '<li id="' + itemId + '">',
          '<input type="checkbox">',
          '<label class="' + menuItem.class + '" id="' + itemId + '"> ' +
            menuItem.text +
          '</label>',
        '</li>'
      ];

      $items.append(itemHtml.join('\n'));

      $('#' + itemId).click(function(){

        menuItem.onClick(this);
      });
    });

    $selector.hideMenu = hideMenu;

    return $selector;
  }

  /////////////////////////////////////////////////////////////
  // Add needed CSS
  //
  /////////////////////////////////////////////////////////////
  var css = `

    .menu-selector {
        position: absolute;
        width: 140px;
        height: 140px;
    }

    .menu-selector,
    .menu-selector button {
        font-family: 'Oswald', sans-serif;
        font-weight: 300;
    }

    .menu-selector button {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 10px;
        background: #428bca;
        border-radius: 50%;
        border: 0;
        color: white;
        font-size: 20px;
        cursor: pointer;
        transition: all .1s;
      pointer-events: auto;
    }

    .menu-selector button:hover {
      background: #3071a9;
    }

    .menu-selector button:focus {
      outline: none;
    }

    .menu-selector ul {
        position: absolute;
        list-style: none;
        padding: 0;
        margin: 0;
        top: -20px;
        right: -20px;
        bottom: -20px;
        left: -20px;
        pointer-events: none;
    }

    .menu-selector li {
        position: absolute;
        width: 100%;
        height: 100%;
        margin: 0 50%;
        -webkit-transform: rotate(-360deg);
        transition: all 0.8s ease-in-out;
    }

    .menu-selector li input {
      display: none;
    }

    .menu-selector li input + label {
        position: absolute;
        left: 50%;
        bottom: 100%;
        width: 0;
        height: 0;
        line-height: 1px;
        margin-left: 0;
        background: #fff;
        border-radius: 50%;
        text-align: center;
        font-size: 1px;
        overflow: hidden;
        cursor: pointer;
        box-shadow: none;
        transition: all 0.8s ease-in-out, color 0.1s, background 0.1s;
        pointer-events: auto;
    }

    .menu-selector li input + label {
        background: #86d2ff;
    }

    .menu-selector li input + label:hover {
      background: #A6DA7F;
    }

    .menu-selector li input:checked + label {
        background: #5cb85c;
        color: white;
    }

    .menu-selector li input:checked + label:hover {
      background: #449d44;
    }

    .menu-selector.open li input + label {
        width: 80px;
        height: 80px;
        line-height: 80px;
        margin-left: -40px;
        box-shadow: 0 3px 3px rgba(0, 0, 0, 0.1);
        font-size: 14px;
    }

    /* For Viewer */
    .menu-container .menu-selector {
        width: 32px;
        height: 32px;
        z-index: 5;
    }

    .menu-container .menu-selector ul {
        top: -80px;
        right: -80px;
        bottom: -80px;
        left: -80px;
        pointer-events: none ;
    }

    .menu-container .menu-selector li {
        margin: 0 auto;
    }

    .menu-container .menu-selector button {
        width: 32px;
        height: 32px;
        background: transparent;
        padding: 0px;
    }`;

    $('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.RadialMenu.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.RadialMenu.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.RadialMenu;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.RadialMenu',
  Autodesk.ADN.Viewing.Extension.RadialMenu);