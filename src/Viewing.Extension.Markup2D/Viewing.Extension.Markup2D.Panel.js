import SwitchButton from 'SwitchButton'

/////////////////////////////////////////////////////////////////
// MarkupPanel
//
/////////////////////////////////////////////////////////////////
export default function Markup2DPanel(
  viewer,
  panelId,
  btnElement) {

  /////////////////////////////////////////////////////////////////
  // Base class constructor
  //
  /////////////////////////////////////////////////////////////////
  Autodesk.Viewing.UI.DockingPanel.call(
    this,
    viewer.container,
    panelId,
    'Markup 2D',
    {shadow: true});

  /////////////////////////////////////////////////////////////////
  // "Private" members
  //
  /////////////////////////////////////////////////////////////////
  var _thisPanel = this;

  var _viewMode = true;

  var _controlIds = [];

  var _layerItems = {};

  var MarkupsCore = null;

  var _isVisible = false;

  var _isMinimized = false;

  var _markupsExtension = null;

  /////////////////////////////////////////////////////////////
  // Custom html
  //
  /////////////////////////////////////////////////////////////
  function generateHtml(id) {

    var html = `

      <div class="container">

        <div class="switch-container" id="${id}-switch-container"
             data-placement="bottom"
             data-toggle="tooltip"
             title="Switch between Edit/View Mode">
        </div>

        <div id="${id}-dropdown-mode-container"
             class="dropdown-mode-container">
        </div>

        <hr class="v-spacer">

        <div style="clear: left;">

          <input type="text" id="${id}-spectrum"/>

          <input id="${id}-style" type="text"
              class="input styles"
              value='"stroke-width":0.1, "stroke-opacity":1'
              data-placement="bottom"
              data-toggle="tooltip"
              title="Set svg style properties">

        </div>

        <hr class="v-spacer-large">

        <div style="clear: left;">

          <button class="btn btn-info btn-row"
                  id="${id}-btn-undo"
                  data-placement="bottom"
                  data-toggle="tooltip"
                  title="Undo last markup action"
                  disabled>
           <span class="fa fa-undo btn-span">
           </span>
              Undo
          </button>

          <button class="btn btn-info btn-row"
                  id="${id}-btn-redo"
                  data-placement="bottom"
                  data-toggle="tooltip"
                  title="Redo last markup action"
                  disabled>
           <span class="fa fa-repeat btn-span">
           </span>
              Redo
          </button>

          <button class="btn btn-info btn-row"
                  id="${id}-btn-clear-all"
                  data-placement="bottom"
                  data-toggle="tooltip"
                  title="Clear All current markups"
                  disabled>
           <span class="glyphicon glyphicon-trash btn-span">
           </span>
              Clear
          </button>
        </div>

        <hr class="v-spacer-large">

        <div class="layer-container">

          <button class="btn btn-info"
                  id="${id}-btn-save"
                  data-placement="bottom"
                  data-toggle="tooltip"
                  title="Save current markups as layer"
                  disabled>
            <span class="glyphicon glyphicon-floppy-open btn-span"
                  aria-hidden="true">
            </span>
            Save
          </button>

          <input id="${id}-layer-name" type="text"
            class="input"
            placeholder=" Layer Name ...">

          <hr class="v-spacer-large">

          <div class="layer-list" id="${id}-layer-list">

          </div>

        </div>

      </div>`;

    return html;
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  function initialize() {

    _thisPanel.content = document.createElement('div');

    $(_thisPanel.container).addClass('markup');

    $(_thisPanel.container).append(generateHtml(panelId));

    //$('[data-toggle="tooltip"]').tooltip();

    var modes = [
      {
        label: 'Arrow',
        handler: ()=>{
          setEditMode('arrow');
        }
      },
      {
        label: 'Circle',
        handler: ()=>{
          setEditMode('circle');
        }
      },
      {
        label: 'Cloud',
        handler: ()=>{
          setEditMode('cloud');
        }
      },
      {
        label: 'Free Hand',
        handler: ()=>{
          setEditMode('freehand');
        }
      },
      {
        label: 'Rectangle',
        handler: ()=>{
          setEditMode('rectangle');
        }
      },
      {
        label: 'Text',
        handler: ()=>{
          setEditMode('text');
        }
      }
    ];

    var dropdown = createDropdownMenu(
      `#${panelId}-dropdown-mode-container`,
      'Markup Mode',
      modes);

    $(`#${panelId}-spectrum`).spectrum({
      color: '#FF0000',
      change: function (color) {

        var clr = color.toHexString();
      }
    });

    _controlIds = [
      `#${dropdown.buttonId}`,
      `#${panelId}-btn-undo`,
      `#${panelId}-btn-redo`,
      `#${panelId}-btn-clear-all`,
      `#${panelId}-btn-save`
    ];

    _thisPanel.switchMode = new SwitchButton(
      `#${panelId}-switch-container`, false)

    _thisPanel.switchMode.on('checked', (checked) => {

      checked ? enterEditMode() : enterViewMode()
    })

    $(`#${panelId}-btn-undo`).click(onUndo);
    $(`#${panelId}-btn-redo`).click(onRedo);
    $(`#${panelId}-btn-clear-all`).click(onClearMarkups);
    $(`#${panelId}-btn-save`).click(onSaveLayer);

    $(`#${panelId}-style`).focusout(setMarkupStyle);
  }

  ///////////////////////////////////////////////////////////////////////////
  // Creates dropdown menu from input
  //
  ///////////////////////////////////////////////////////////////////////////
  function createDropdownMenu(parent, title, menuItems, selectedItemIdx) {

    var buttonId = guid();

    var labelId = guid();

    var menuId = guid();

    var listId = guid();

    var html = `
        <div id="${menuId}" class="dropdown chart-dropdown">
          <button id="${buttonId}"
                  class="btn btn-default btn-dropdown dropdown-toggle"
                  type="button"
                  data-toggle="dropdown"
                  disabled>
          <label id="${labelId}"
                 style="font: normal 14px Times New Roman; margin-top:-4px;">
            ${title}
          </label>
          <span class="caret btn-span"></span>
          </button>
          <ul id="${listId}" class="dropdown-menu scrollable-menu">
          </ul>
        </div>
      `;

    $(parent).append(html);

    $('#' + labelId).text(
      title + ': ' + menuItems[selectedItemIdx || 0].label);

    menuItems.forEach(function(menuItem){

      var itemId = guid();

      var itemHtml = `
          <li id="${itemId}">
            <a href="">${menuItem.label}</a>
          </li>`;

      $('#' + listId).append(itemHtml);

      $('#' + itemId).click(function(event) {

        event.preventDefault();

        menuItem.handler();

        $('#' + labelId).text(
          title + ': ' + menuItem.label);
      });
    });

    return {
      menuId: menuId,
      buttonId: buttonId
    };
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  function enterEditMode() {

    _viewMode = false;

    _markupsExtension.hide();

    _markupsExtension.enterEditMode();

    _controlIds.forEach((id)=> {

      $(id).prop('disabled', false);
    });

    $(`#${panelId}-layer-list`).removeClass(
      'view-mode');

    setMarkupStyle();
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  function enterViewMode() {

    _viewMode = true;

    _markupsExtension.leaveEditMode();

    _markupsExtension.show();

    _controlIds.forEach((id)=> {

      $(id).prop('disabled', true);
    });

    $(`#${panelId}-layer-list`).addClass(
      'view-mode');

    loadMarkups();
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  function onUndo() {

    _markupsExtension.undo();
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  function onRedo() {

    _markupsExtension.redo();
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  function onClearMarkups() {

    _markupsExtension.clear();
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  function onSaveLayer() {

    var $input = $(`#${panelId}-layer-name`);

    var name = $input.val();

    $input.val('');

    name = (name.length ?
      name :
      (new Date().toString('d/M/yyyy H:mm:ss')).split('GMT')[0]);

    var item = {
      name: name,
      id: guid(),
      enabled: false,
      markupData: _markupsExtension.generateData()
    }

    _layerItems[item.id] = item;

    addLayerItem(item);
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  function addLayerItem(item) {

    var itemHtml = `

        <div id="${item.id}"
             class="list-group-item ${item.enabled ? 'enabled' : ''}">

            ${item.name}

            <button id="${item.id}-delete-btn"
                    class="btn btn-danger btn-list">
              <span class="glyphicon glyphicon-remove-sign btn-span-list">
              </span>
            </button>
        </div>
      `;

    $(`#${panelId}-layer-list`).append(itemHtml);

    var $item = $(`#${item.id}`);

    $item.click(()=>{

      if(_viewMode) {

        $item.toggleClass('enabled');

        if ($item.hasClass('enabled')) {

          _markupsExtension.loadMarkups(
            item.markupData,
            item.id);

          //_markupsExtension.showMarkups(item.id);
        }
        else {

          _markupsExtension.unloadMarkups(item.id);

          //_markupsExtension.hideMarkups(item.id);
        }
      }
    });

    $(`#${item.id}-delete-btn`).click(()=>{

      _markupsExtension.unloadMarkups(item.id);

      delete _layerItems[item.id];

      $item.remove();
    });
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  function loadMarkups() {

    $('.markup .list-group-item').each(function(){

      var $item = $(this);

      if($item.hasClass('enabled')) {

        var item = _layerItems[this.id];

        _markupsExtension.loadMarkups(
          item.markupData,
          item.id);
      }
    });
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  function setEditMode(mode) {

    switch(mode){

      case 'arrow':

        var mode = new MarkupsCore.EditModeArrow(_markupsExtension);
        _markupsExtension.changeEditMode(mode);
        break;

      case 'circle':

        var mode = new MarkupsCore.EditModeCircle(_markupsExtension);
        _markupsExtension.changeEditMode(mode);
        break;

      case 'cloud':

        var mode = new MarkupsCore.EditModeCloud(_markupsExtension);
        _markupsExtension.changeEditMode(mode);
        break;

      case 'freehand':

        var mode = new MarkupsCore.EditModeFreehand(_markupsExtension);
        _markupsExtension.changeEditMode(mode);
        break;

      case 'rectangle':

        var mode = new MarkupsCore.EditModeRectangle(_markupsExtension);
        _markupsExtension.changeEditMode(mode);
        break;

      case 'text':

        var mode = new MarkupsCore.EditModeText(_markupsExtension);
        _markupsExtension.changeEditMode(mode);
        break;
    }
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  function setMarkupStyle() {

    if(!_viewMode) {

      try {

        var styleStr = '{' + $(`#${panelId}-style`).val() + '}';

        var style = JSON.parse(styleStr);

        var styleAttributes = ['stroke-width', 'stroke-color', 'stroke-opacity'];
        var nsu = Autodesk.Viewing.Extensions.Markups.Core.Utils;
        var styleObject = nsu.createStyle(styleAttributes, viewer);
        console.log(JSON.stringify(styleObject))
        console.log(style)

        _markupsExtension.setStyle(style);
      }
      catch(ex){

        console.log(ex);
      }
    }
  }

  /////////////////////////////////////////////////////////////
  // unload extension
  //
  /////////////////////////////////////////////////////////////
  _thisPanel.unload = function() {

    _thisPanel.setVisible(false);

    deactivateMarkups();
  }

  /////////////////////////////////////////////////////////////
  // setVisible override
  //
  /////////////////////////////////////////////////////////////
  _thisPanel.setVisible = function(show) {

    _isVisible = show;

    Autodesk.Viewing.UI.DockingPanel.prototype.
      setVisible.call(this, show);

    if(show){

      btnElement.classList.add('active');

      viewer.loadExtension("Autodesk.Viewing.MarkupsCore");

      _markupsExtension = viewer.getExtension(
        "Autodesk.Viewing.MarkupsCore");

      MarkupsCore = Autodesk.Viewing.Extensions.Markups.Core;

      enterViewMode();
    }
    else {

      btnElement.classList.remove('active');

      viewer.unloadExtension("Autodesk.Viewing.MarkupsCore");

      _markupsExtension = null;
    }
  }

  /////////////////////////////////////////////////////////////
  // Toggles panel visibility
  //
  /////////////////////////////////////////////////////////////
  _thisPanel.toggleVisibility = function() {

    _thisPanel.setVisible(!_isVisible);
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
Markup2DPanel.prototype = Object.create(
  Autodesk.Viewing.UI.DockingPanel.prototype)

Markup2DPanel.prototype.constructor = Markup2DPanel

///////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////
function guid(format = 'xxxxxxxxxx') {

  var d = new Date().getTime();

  var guid = format.replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });

  return guid;
}