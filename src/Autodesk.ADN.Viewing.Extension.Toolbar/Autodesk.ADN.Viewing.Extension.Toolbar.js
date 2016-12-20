///////////////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Toolbar
// by Philippe Leefsma, March 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Toolbar = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _viewer = viewer;

  var _this = this;

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  _this.load = function () {

    createToolbarItems();

    console.log('Autodesk.ADN.Viewing.Extension.Toolbar loaded');

    return true;
  };

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  _this.unload = function () {

    deleteToolbarItems();

    console.log('Autodesk.ADN.Viewing.Extension.Toolbar unloaded');

    return true;
  };

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function createToolbarItems() {

    var viewerToolbar = _viewer.getToolbar(true);

    if (viewerToolbar) {

      var modelTools = viewerToolbar.getControl(
        Autodesk.Viewing.TOOLBAR.MODELTOOLSID);

      if (modelTools && modelTools.getNumberOfControls() > 0) {

        onViewerToolbarCreated();

      } else {

        viewer.addEventListener(
          Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
          onViewerToolbarCreated);
      }
    } else {

      viewer.addEventListener(
        Autodesk.Viewing.TOOLBAR_CREATED_EVENT,
        onViewerToolbarCreated);
    }

    createDivToolbar();
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function deleteToolbarItems() {

    $('#divToolbar').remove();

    var viewerToolbar = _viewer.getToolbar(true);

    viewerToolbar.removeControl(
      "Autodesk.ADN.Viewing.Extension.Toolbar.ControlGroup");

    var modelTools = viewerToolbar.getControl(
      Autodesk.Viewing.TOOLBAR.MODELTOOLSID);

    modelTools.removeControl(
      "Autodesk.ADN.Viewing.Extension.Toolbar.ModelToolsBtn");

    modelTools.removeControl(
      "Autodesk.ADN.Viewing.Extension.Toolbar.Combo");

    modelTools.removeControl(
      "Autodesk.ADN.Viewing.Extension.Toolbar.Radio");
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function onViewerToolbarCreated() {

    createButtonInExistingControlGroup();

    createButtonInNewControlGroup();

    createComboButton();

    //createRadioButton();
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function createButton(id, imgUrl, tooltip, handler) {

    var button = new Autodesk.Viewing.UI.Button(id);

    button.icon.style.backgroundImage = imgUrl;

    button.setToolTip(tooltip);

    button.onClick = handler;

    return button;
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function createButtonInExistingControlGroup() {

    var viewerToolbar = _viewer.getToolbar(true);

    var modelTools = viewerToolbar.getControl(
      Autodesk.Viewing.TOOLBAR.MODELTOOLSID);

    var button = createButton(
      'Autodesk.ADN.Viewing.Extension.Toolbar.ModelToolsBtn',
      'url(img/adsk/adsk-24x24-32.png)',
      'ModelTools button',
      function (e){
        alert("ModelTools button clicked!");
      });

    modelTools.addControl(button, {index:1});
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function createButtonInNewControlGroup() {

    var viewerToolbar = _viewer.getToolbar(true);

    var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
      "Autodesk.ADN.Viewing.Extension.Toolbar.ControlGroup");

    var button = createButton(
      'Autodesk.ADN.Viewing.Extension.Toolbar.ControlGroupBtn',
      'url(img/adsk/adsk-24x24-32.png)',
      'Control group button',
      function (e) {
        alert("Control group button clicked!");
      });

    ctrlGroup.addControl(button);

    viewerToolbar.addControl(ctrlGroup);
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function createComboButton() {

    var viewerToolbar = _viewer.getToolbar(true);

    var modelTools = viewerToolbar.getControl(
      Autodesk.Viewing.TOOLBAR.MODELTOOLSID);

    var combo = new Autodesk.Viewing.UI.ComboButton(
      "Autodesk.ADN.Viewing.Extension.Toolbar.Combo");

    combo.setToolTip('Demo combo');

    combo.icon.style.backgroundImage =
      'url(img/adsk/adsk-24x24-32.png)';

    combo.onClick = function(e) {
      alert("I'm a combo control!");
    };

    var comboBtn1 = createButton(
      'Autodesk.ADN.Viewing.Extension.Toolbar.ComboBtn1',
      'url(img/adsk/adsk-24x24-32.png)',
      'Combo button1',
      function(e) {
        alert("I'm a combo button!");
      });

    var comboBtn2 = createButton(
      'Autodesk.ADN.Viewing.Extension.Toolbar.ComboBtn2',
      'url(img/adsk/adsk-24x24-32.png)',
      'Combo button2',
      function(e) {
        alert("I'm another combo button!");
      });

    combo.addControl(comboBtn1);
    combo.addControl(comboBtn2);

    modelTools.addControl(combo);
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function createRadioButton() {

    var viewerToolbar = _viewer.getToolbar(true);

    var modelTools = viewerToolbar.getControl(
      Autodesk.Viewing.TOOLBAR.MODELTOOLSID);

    var radio = new Autodesk.Viewing.UI.RadioButtonGroup(
      "Autodesk.ADN.Viewing.Extension.Toolbar.Radio");

    radio.addClass('toolbar-vertical-group');

    var radioBtn1 = createButton(
      'Autodesk.ADN.Viewing.Extension.Toolbar.RadioBtn1',
      'url(img/adsk/adsk-24x24-32.png)',
      'Radio button1',
      function(e) {
        alert("I'm a radio button!");
      });

    var radioBtn2 = createButton(
      'Autodesk.ADN.Viewing.Extension.Toolbar.RadioBtn2',
      'url(img/adsk/adsk-24x24-32.png)',
      'Radio button2',
      function(e) {
        alert("I'm another radio button!");
      });

    radio.addControl(radioBtn1);
    radio.addControl(radioBtn2);

    modelTools.addControl(radio);
  }

  /////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////
  function createDivToolbar() {

    //$(htmlDlg).appendTo('#appBodyId');

    var toolbarDivHtml =
      '<div id="divToolbar"> </div>';

    $(_viewer.container).append(toolbarDivHtml);

    $('#divToolbar').css({
      'top': '20%',
      'left': '20%',
      'z-index': '100',
      'position': 'absolute'
    });

    var toolbar = new Autodesk.Viewing.UI.ToolBar(true);

    var ctrlGroup = new Autodesk.Viewing.UI.ControlGroup(
      "Autodesk.ADN.Viewing.Extension.Toolbar.ControlGroup2");

    var button = new Autodesk.Viewing.UI.Button(
      "Autodesk.ADN.Viewing.Extension.Toolbar.ControlGroupBtn2");

    button.icon.style.backgroundImage =
      "url(img/adsk/adsk-24x24-32.png)";

    button.setToolTip("Div Toolbar button");

    button.onClick = function (e) {

      $('#demoDlg').modal('show');
    };

    ctrlGroup.addControl(button);

    toolbar.addControl(ctrlGroup);

    $('#divToolbar')[0].appendChild(
      toolbar.container);
  }

  var htmlDlg = '<div id="demoDlg" ' +
    'class="modal fade" role="dialog" ' +
    'aria-labelledby="myModalLabel" aria-hidden="true">' +
    '<div class="modal-dialog">' +
    '<div class="modal-content id="aboutDlgFrame">' +
    '<div class="modal-header">' +
    '<button type="button" class="close" data-dismiss="modal">' +
    ' <span aria-hidden="true">&times;</span>' +
    ' <span class="sr-only"> Close </span>' +
    '</button>' +
    '<h4 class="modal-title">' +
    '<img  height="24" width="24" src="img/adsk/adsk-24x24-32.png"/>' +
    'Just a Demo Dialog ...' +
    '</h4>' +
    '</div>' +
    '<div id="demoDlgBody" class="modal-body">' +
    ' Written by' +
    ' <a href="http://adndevblog.typepad.com/cloud_and_mobile/philippe-leefsma.html" target="_blank">' +
    ' Philippe Leefsma' +
    ' </a>' +
    ' <br/><br/><b>Autodesk Developer Network</b><br/> November 2014' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button type="button" class="btn btn-default" data-dismiss="modal">Got it</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
};

Autodesk.ADN.Viewing.Extension.Toolbar.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Toolbar.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Toolbar;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Toolbar',
  Autodesk.ADN.Viewing.Extension.Toolbar);

