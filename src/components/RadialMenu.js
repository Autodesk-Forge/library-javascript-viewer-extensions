/////////////////////////////////////////////////////////////////
// Creates dom elements and animation logic for radial menu
//
/////////////////////////////////////////////////////////////////
function createRadialMenu(
  menuItems,
  parent,
  category,
  buttonContentHtml) {

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

  var $parent = $(parent);

  var containerId = guid();

  var selectorId = guid();

  var triggerId = guid();

  var itemsId = guid();

  var html = `

    <div class="menu-container" id="${containerId}">
      <div class="menu-selector" id="${selectorId}" style="display:none;">
        <ul id="${itemsId}">
        </ul>
        <button id="${triggerId}" class="${category}">
          <div class="radial-menu-btn-content">
            ${buttonContentHtml}
          </div>
        </button>
      </div>
    </div>
  `;

  $parent.append(html);

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
var radialMenucss = `

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
      z-index: 1;
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
    }

    .radial-menu-btn-content {
      width: 32px;
      height: 32px;
      overflow: hidden;
    }
    `;

$('<style type="text/css">' + radialMenucss + '</style>').appendTo('head');