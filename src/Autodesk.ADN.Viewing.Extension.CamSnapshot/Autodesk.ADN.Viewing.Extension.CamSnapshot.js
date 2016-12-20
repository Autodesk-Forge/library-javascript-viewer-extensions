///////////////////////////////////////////////////////////////////////////////
// CamSnapshot viewer extension
// by Philippe Leefsma, July 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.CamSnapshot = function (viewer, options) {

  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _self = this;

  var _panel = null;

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  _self.load = function () {

    Autodesk.ADN.Viewing.Extension.CamSnapshot.Panel = function(
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

        '<div class="snapshot-container">',
          '<div id="video-container" class="snapshot" style="z-index: 0">',
            '<video id="snapshot-video" width="100%" height="100%" autoplay>',
              'Video not supported...',
            '</video>',
          '</div>',

          '<div id="img-container" class="snapshot" style="z-index: 1">',
            '<img id="snapshot-img" width="100%" height="100%" src="">',
          '</div>',

          '<canvas id="snapshot-canvas" style="display:none;">',
          '</canvas>',
        '</div>',

        '<button id="snapshot-btn" class="btn btn-primary">',
          'New Snapshot',
          '<span class="glyphicon glyphicon-camera"></span>',
        '</button>',

      ].join('\n');

      $(this.scrollContainer).append(html);

      initialize();
    };

    Autodesk.ADN.Viewing.Extension.CamSnapshot.Panel.prototype =
      Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);

    Autodesk.ADN.Viewing.Extension.CamSnapshot.Panel.prototype.constructor =
      Autodesk.ADN.Viewing.Extension.CamSnapshot.Panel;

    Autodesk.ADN.Viewing.Extension.CamSnapshot.Panel.prototype.
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

    _panel = new Autodesk.ADN.Viewing.Extension.CamSnapshot.Panel(
      viewer.container,
      guid(),
      'CAMERA Snapshot',
      0, 0);

    _panel.setVisible(true);

    console.log('Autodesk.ADN.Viewing.Extension.CamSnapshot loaded');

    return true;
  };

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  _self.unload = function () {

    _panel.setVisible(false);

    _panel.uninitialize();

    console.log('Autodesk.ADN.Viewing.Extension.CamSnapshot unloaded');

    return true;
  };

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  function initialize() {

    function show(id, visible) {

      document.getElementById(id).style.display =
        (visible ? "inherit" : "none");
    }

    function onVideoClicked() {

      var video = document.getElementById('snapshot-video');
      var canvas = document.getElementById('snapshot-canvas');
      var ctx = canvas.getContext('2d');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // "image/webp" works in Chrome.
      // Other browsers will fall back to image/png.
      document.getElementById('snapshot-img').src = canvas.toDataURL('image/webp');

      show('img-container', true);
      show('video-container', false);
    }

    function onSnapshotClicked() {

      show('video-container', true);
      show('img-container', false);
    }

    navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

    navigator.getUserMedia(
      {video: true},
      function(stream) {

        var video = document.getElementById('snapshot-video');

        video.addEventListener('loadedmetadata',function() {

          var ratio = video.videoWidth / video.videoHeight;

          var img = document.getElementById('snapshot-img');

          img.height = parseInt(600/ratio, 10);
        });

        video.src = window.URL.createObjectURL(stream);
        video.addEventListener('click', onVideoClicked, false);

      }, function(err) {

        console.log("getUserMedia error: " + err.name);
      });

    show('img-container', false);

    var btn = document.getElementById('snapshot-btn');
    btn.addEventListener('click', onSnapshotClicked, false);
  }

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

    '.snapshot-container{',
      'height:500px;',
    '}',

    '.snapshot{',
      'width: 600px;',
      'height: 500px;',
      'position: absolute',
    '}',

  ].join('\n');

  $('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.CamSnapshot.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.CamSnapshot.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.CamSnapshot;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.CamSnapshot',
  Autodesk.ADN.Viewing.Extension.CamSnapshot);

