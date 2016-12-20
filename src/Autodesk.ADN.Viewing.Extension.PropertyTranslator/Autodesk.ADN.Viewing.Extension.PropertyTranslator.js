///////////////////////////////////////////////////////////////////////////////
// PropertyTranslator viewer Extension
// by Philippe Leefsma, September 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.PropertyTranslator = function (viewer, options) {
    
    Autodesk.Viewing.Extension.call(this, viewer, options);
    
    var _thisExtension = this;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _thisExtension.load = function () {
        
        var panel = new Autodesk.ADN.Viewing.Extension.PropertyTranslator.Panel(
            viewer);

        viewer.setPropertyPanel(panel);

        console.log("Autodesk.ADN.Viewing.Extension.PropertyTranslator loaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _thisExtension.unload = function () {

        viewer.setPropertyPanel(null);

        console.log("Autodesk.ADN.Viewing.Extension.PropertyTranslator unloaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // Custom Property Panel
    //
    ///////////////////////////////////////////////////////////////////////////
    Autodesk.ADN.Viewing.Extension.PropertyTranslator.Panel = function (viewer) {

        var _thisPanel = this;

        var _selectedNodeId = '';
        
        Autodesk.Viewing.Extensions.ViewerPropertyPanel.call(
          _thisPanel,
          viewer);

        ///////////////////////////////////////////////////////////////////////
        // ViewerPropertyPanel.setNodeProperties override
        //
        ///////////////////////////////////////////////////////////////////////
        _thisPanel.setNodeProperties = function(nodeId) {
            
            Autodesk.Viewing.Extensions.ViewerPropertyPanel.
              prototype.setNodeProperties.call(
              _thisPanel,
              nodeId);
            
            _selectedNodeId = nodeId;
        };

        ///////////////////////////////////////////////////////////////////////
        // ViewerPropertyPanel.setProperties override
        //
        ///////////////////////////////////////////////////////////////////////
        _thisPanel.setProperties = function (properties) {

            $.get('/node/gallery/api/token/translator', function(response){

                var token = response.access_token;

                async.each(properties,

                  function(prop, callback) {

                      if(prop.type == 20) {

                          //prop.displayName = '';
                          //prop.displayValue = '';
                          //prop.displayCategory = '';

                          translate(token, {
                              text: prop.displayValue,
                              from: 'en',
                              to:'fr'
                          }, function(text){
                              
                              prop.displayValue = text;
                                callback();
                          },
                          function(error){

                              prop.displayValue = prop.displayValue + ' (translation error)';
                              callback();
                          });
                      }
                      else {
                          callback();
                      }
                  },
                  function(err){

                      Autodesk.Viewing.Extensions.ViewerPropertyPanel.
                        prototype.setProperties.call(
                        _thisPanel, properties);
                  });
            });
        };

        ///////////////////////////////////////////////////////////////////////
        // Microsoft Translator API
        //
        ///////////////////////////////////////////////////////////////////////
        function translate(token, data, onSuccess, onError) {

            var payload = {
                appId: 'Bearer ' + token,
                contentType: 'text/plain',
                from: data.from,
                to: data.to,
                text: encodeURIComponent(data.text)
            };

            $.ajax({

                url: "http://api.microsofttranslator.com/V2/Ajax.svc/Translate",
                type: 'GET',
                jsonp: 'oncomplete',
                dataType: 'jsonp',
                data: payload

            }).done(function (jqXHR, textStatus, errorThrown) {

                //console.log('done', this, jqXHR, textStatus, errorThrown);
                onSuccess(jqXHR);

            }).fail(function (jqXHR, textStatus, errorThrown) {

                console.log('fail', this, jqXHR, textStatus, errorThrown);
                onError(errorThrown);
            });
        }
    };
    
    Autodesk.ADN.Viewing.Extension.PropertyTranslator.Panel.prototype =
      Object.create(Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype);
    
    Autodesk.ADN.Viewing.Extension.PropertyTranslator.Panel.prototype.constructor =
      Autodesk.ADN.Viewing.Extension.PropertyTranslator.Panel;
};

Autodesk.ADN.Viewing.Extension.PropertyTranslator.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.PropertyTranslator.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.PropertyTranslator;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.PropertyTranslator',
    Autodesk.ADN.Viewing.Extension.PropertyTranslator);