///////////////////////////////////////////////////////////////////////////////
// IFramePanel viewer extension
// by Philippe Leefsma, July 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.IFramePanel = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    var _panel = null;

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    _self.load = function () {

        Autodesk.ADN.Viewing.Extension.IFramePanel.Panel = function(
          parentContainer,
          id,
          title,
          x, y)
        {
            this.content = document.createElement('div');

            Autodesk.Viewing.UI.DockingPanel.call(
              this,
              parentContainer,
              id,
              title,
              {shadow:true});

            this.container.style.top = y + "px";
            this.container.style.left = x + "px";

            this.container.style.width = "300px";
            this.container.style.height = "410px";
            this.container.style.resize = "auto";

            this.createScrollContainer({
                 left: false,
                 heightAdjustment: 45,
                 marginTop:0
            });

            var html = [
                '<iframe class="iframe-panel" src="http://adndevblog.typepad.com/cloud_and_mobile">',
                '</iframe>',
            ].join('\n');

            $(this.scrollContainer).append(html);
        };

        Autodesk.ADN.Viewing.Extension.IFramePanel.Panel.prototype =
          Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);

        Autodesk.ADN.Viewing.Extension.IFramePanel.Panel.prototype.constructor =
          Autodesk.ADN.Viewing.Extension.IFramePanel.Panel;

        Autodesk.ADN.Viewing.Extension.IFramePanel.Panel.prototype.
          initialize = function()  {

            this.title = this.createTitleBar(
              this.titleLabel ||
              this.container.id);

            this.closer = this.createCloseButton();

            this.container.appendChild(this.title);
            this.title.appendChild(this.closer);
            this.container.appendChild(this.content);

            this.initializeMoveHandlers(this.container);
            this.initializeCloseHandler(this.closer);
        };

        _panel = new Autodesk.ADN.Viewing.Extension.IFramePanel.Panel(
          viewer.container,
          guid(),
          'IFrame Panel',
          0, 0);

        _panel.setVisible(true);

        console.log('Autodesk.ADN.Viewing.Extension.IFramePanel loaded');

        return true;
    };

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    _self.unload = function () {

        _panel.setVisible(false);

        _panel.uninitialize();

        console.log('Autodesk.ADN.Viewing.Extension.IFramePanel unloaded');

        return true;
    };

    /////////////////////////////////////////////////////////
    // Generates random guid
    //
    /////////////////////////////////////////////////////////
    function guid() {

        var d = new Date().getTime();

        var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
          /[xy]/g,
          function (c) {
              var r = (d + Math.random() * 16) % 16 | 0;
              d = Math.floor(d / 16);
              return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
          });

        return guid;
    };


    var css = [

        'iframe.iframe-panel {',
            'width: 100%;',
            'height: 1000px;',
        '}',

    ].join('\n');

    $('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.IFramePanel.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.IFramePanel.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.IFramePanel;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.IFramePanel',
  Autodesk.ADN.Viewing.Extension.IFramePanel);

