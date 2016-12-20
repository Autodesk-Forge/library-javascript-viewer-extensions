/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.BootstrapPanel
// by Philippe Leefsma, May 2015
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.BootstrapPanel = function (viewer, options) {
  
  Autodesk.Viewing.Extension.call(this, viewer, options);
  
  var _panel = null;
  
  /////////////////////////////////////////////////////////////////
  // Extension load callback
  //
  /////////////////////////////////////////////////////////////////
  this.load = function () {

    _panel = new Panel(
      viewer.container,
      guid());

    _panel.setVisible(true);

    console.log('Autodesk.ADN.Viewing.Extension.BootstrapPanel loaded');

    return true;
  }
  
  /////////////////////////////////////////////////////////////////
  //  Extension unload callback
  //
  /////////////////////////////////////////////////////////////////
  this.unload = function () {
    
    _panel.setVisible(false);
    
    console.log('Autodesk.ADN.Viewing.Extension.BootstrapPanel unloaded');
    
    return true;
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
  // The demo Panel
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
      'Bootstrap Panel',
      {shadow:true});
    
    $(_thisPanel.container).addClass('bootstrap-panel');

    /////////////////////////////////////////////////////////////
    // Custom html
    //
    /////////////////////////////////////////////////////////////
    var html = `
      <div class="panel-container">
        <form class="form-inline bootstrap-form-with-validation">
            <div class="row">
                <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
                    <label class="control-label sr-only" for="email-input">Email </label>
                    <input class="input-input-row input-sign-in" type="email" placeholder="Email" id="email-input">
                </div>
                <div class="form-group col-xs-12 col-sm-4 col-md-4 col-lg-4">
                    <label class="control-label sr-only" for="password-input">Password </label>
                    <input class="input-input-row input-sign-in" type="password" placeholder="Password" id="password-input">
                </div>
            </div>
        </form>
        <div class="row">
            <div class="col-md-12 col-xs-12 col-sm-3 col-md-3 col-lg-3">
                <div class="checkbox">
                    <label>
                        <input type="checkbox"> Remember me</label>
                </div>
            </div>
            <div class="col-md-12 col-xs-12 col-sm-6 col-md-6 col-lg-6">
                <button class="btn btn-default btn-input-row btn-sign-in" type="submit"><span class="span-input-row glyphicon glyphicon-user"> </span> Sign in</button>
            </div>
        </div>
        <hr class="hr-panel">
        <div class="row">
            <div class="col-md-12">
                <div class="input-row-label-container"><span class="label label-default input-row-label">Offset:</span></div>
                <div class="input-row-spacer"></div>
                <input type="text" placeholder="X Value ..." class="col-xs-1 col-sm-2 col-md-2 col-lg-2 input-input-row">
                <div class="input-row-spacer"></div>
                <button class="btn btn-default btn-input-row" type="button"><span class="span-input-row glyphicon glyphicon-screenshot"> </span> Button</button>
            </div>
        </div>
        <hr class="hr-panel">
        <div class="row">
            <div class="col-md-12">
                <div class="input-row-label-container"><span class="label label-default input-row-label">Min/Max: </span></div>
                <div class="input-row-spacer"></div>
                <input type="text" placeholder="X Value ..." class="col-xs-1 col-sm-2 col-md-2 col-lg-2 input-input-row">
                <div class="input-row-spacer"></div>
                <input type="text" placeholder="Y Value ..." class="col-xs-1 col-sm-2 col-md-2 col-lg-2 input-input-row">
                <div class="input-row-spacer"></div>
                <button class="btn btn-default btn-input-row" type="button"><span class="span-input-row glyphicon glyphicon-screenshot"> </span> Button</button>
            </div>
        </div>
        <hr class="hr-panel">
        <div class="row">
            <div class="col-md-12">
                <div class="input-row-label-container"><span class="label label-default input-row-label">Position: </span></div>
                <div class="input-row-spacer"></div>
                <input type="text" placeholder="X Value ..." class="col-xs-1 col-sm-2 col-md-2 col-lg-2 input-input-row">
                <div class="input-row-spacer"></div>
                <input type="text" placeholder="Y Value ..." class="col-xs-1 col-sm-2 col-md-2 col-lg-2 input-input-row">
                <div class="input-row-spacer"></div>
                <input type="text" placeholder="Z Value ..." class="col-xs-1 col-sm-2 col-md-2 col-lg-2 input-input-row">
                <div class="input-row-spacer"></div>
                <button class="btn btn-default btn-input-row" type="button"><span class="span-input-row glyphicon glyphicon-screenshot"> </span> Button</button>
            </div>
        </div>
        <hr class="panel-vertical-spacer">
        <div class="row">
            <div class="col-md-12">
                <div class="input-row-label-container"><span class="label label-default input-row-label">Rotation: </span></div>
                <div class="input-row-spacer"></div>
                <input type="text" placeholder="X Value ..." class="col-xs-1 col-sm-2 col-md-2 col-lg-2 input-input-row">
                <div class="input-row-spacer"></div>
                <input type="text" placeholder="Y Value ..." class="col-xs-1 col-sm-2 col-md-2 col-lg-2 input-input-row">
                <div class="input-row-spacer"></div>
                <input type="text" placeholder="Z Value ..." class="col-xs-1 col-sm-2 col-md-2 col-lg-2 input-input-row">
                <div class="input-row-spacer"></div>
                <button class="btn btn-default col-xs-1 col-sm-2 col-md-2 col-lg-2 btn-input-row" type="button"><span class="span-input-row glyphicon glyphicon-screenshot"> </span> Button</button>
            </div>
        </div>
        <hr class="hr-panel">
        <div class="row">
            <div class="col-xs-12 col-sm-3 col-md-3 col-lg-3">
                <div class="dropdown">
                    <button class="btn btn-default dropdown-toggle btn-input-row" data-toggle="dropdown" aria-expanded="false" type="button">Drop <span class="caret"></span></button>
                    <ul class="dropdown-menu" role="menu">
                        <li><a href="#">Foo</a></li>
                        <li><a href="#">Bar</a></li>
                        <li><a href="#">Baz</a></li>
                    </ul>
                </div>
            </div>
            <hr class="visible-xs-inline panel-vertical-spacer">
            <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                <div class="radio col-xs-4 col-sm-4 col-md-4 col-lg-4 radio-input-row">
                    <label>
                        <input type="radio">Radio 1</label>
                </div>
                <div class="radio col-xs-4 col-sm-4 col-md-4 col-lg-4 radio-input-row">
                    <label>
                        <input type="radio">Radio 2</label>
                </div>
            </div>
        </div>
        <hr class="hr-panel">
        <input type="file">
        <hr class="panel-vertical-spacer">
        <div class="progress">
            <div class="progress-bar progress-bar-info progress-bar-striped active" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 45%;">45%</div>
        </div>
        <hr class="hr-panel">
        <div class="input-group">
            <div class="input-group-addon"><span>Search</span></div>
            <input class="form-control input-group-row" type="text" style="height:24px;" placeholder="Find property...">
            <div class="input-group-btn">
                <button class="btn btn-default" type="button" style="height:24px;z-index:2">Go! </button>
            </div>
        </div>
        <hr class="hr-panel">
        <div class="row">
            <div class="col-md-12">
                <div class="panel-validation-controls-container">
                    <button class="btn btn-default col-xs-1 col-sm-2 col-md-2 col-lg-2 btn-input-row" type="button"><span class="span-input-row glyphicon glyphicon-ok"> </span> OK</button>
                    <div class="input-row-spacer"></div>
                    <button class="btn btn-default col-xs-1 col-sm-2 col-md-2 col-lg-2 btn-input-row" type="button"><span class="span-input-row glyphicon glyphicon-remove"> </span> Cancel</button>
                </div>
            </div>
        </div>
    </div>`;

    _thisPanel.createScrollContainer({
      left: false,
      heightAdjustment: 25,
      marginTop:0
    });

    $(_thisPanel.scrollContainer).append(html);

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
    };
  };
  
  /////////////////////////////////////////////////////////////
  // Set up JS inheritance
  //
  /////////////////////////////////////////////////////////////
  Panel.prototype = Object.create(
    Autodesk.Viewing.UI.DockingPanel.prototype);
  
  Panel.prototype.constructor = Panel;

  /////////////////////////////////////////////////////////////
  // Add needed CSS
  //
  /////////////////////////////////////////////////////////////
  var css = `

    @media (max-width:480px) {

      div.bootstrap-panel {
        top: 0px;'
        left: 0px;
        width: 320px;
        height: 80vh;
        resize: auto;
        background-color: #F1F1F1;
      }

      .input-row-spacer {
        float:left;
        width:1px;
        min-height:1px;
      }

      .input-input-row {
        border-radius:4px;
        max-width: 10px;
        height:24px;
      }
    }

    @media (min-width:481px) {

      div.bootstrap-panel {
        top: 0px;'
        left: 0px;
        min-width: 500px;
        height: 570px;
        resize: auto;
        background-color: #F1F1F1;
      }

      .input-row-spacer {
        float:left;
        width:10px;
        min-height:1px;
      }

      .input-input-row {
        border-radius:4px;
        max-width: 65px;
        height:24px;
      }
    }

    div.bootstrap-panel:hover {
      background-color: #F1F1F1;
    }

    div.bootstrap-panel-minimized {
      height: 34px;
      min-height: 34px
    }

    .panel-container {
      margin:15px;
    }

    .btn-gallery-home {
      min-width:160px;
    }

    .input-row-label-container {
      float:left;
      width:54px;
    }

    .input-row-label {
      vertical-align:bottom;
      background-color:#F1F1F1;
      color:black;
    }

    .btn-input-row {
      width:80px;
      height:24px;
      padding:0;
      top:0;
      vertical-align:top;
      line-height:0;
    }

    .span-input-row {
      top:-1px;
      vertical-align:middle;
    }

    hr.hr-panel {
      border-top:1px solid #1A1FC1;
      margin-right:20px;
      margin-left:20px;
      margin-top:10px;
      margin-bottom:10px;
    }

    hr.panel-vertical-spacer {
      margin:10px;
      border-top:1px;
    }

    div.panel-validation-controls-container {
      position:relative;
      float:right;
      right:20px;
    }

    @media (max-width:480px) {
      .btn-sign-in{
          margin-top:8px;
      }
    }

    @media (min-width:481px) {
      .btn-sign-in{
          float:right;
        margin-top:8px;
        margin-right:184px;
      }
    }

    input.input-sign-in {
      width:90%;
      max-width: 1000px;
    }

    div.input-group {
      width: 96%;
      margin-left: 2%;
    }

    .radio-input-row {
      margin-top:0px;
      margin-bottom:0px;
    }

    . input-group-row {

    }

    .radio + .radio {
      margin-top:0px;
    }`;

  $('<style type="text/css">' + css + '</style>').appendTo('head');
 };

Autodesk.ADN.Viewing.Extension.BootstrapPanel.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.BootstrapPanel.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.BootstrapPanel;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.BootstrapPanel',
  Autodesk.ADN.Viewing.Extension.BootstrapPanel);