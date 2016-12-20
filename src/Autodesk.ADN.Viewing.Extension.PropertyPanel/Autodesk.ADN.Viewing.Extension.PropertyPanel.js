///////////////////////////////////////////////////////////////////////////////
// PropertyPanel viewer Extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");


Autodesk.ADN.Viewing.Extension.PropertyPanel = function (viewer, options) {

    // base constructor
    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _viewer = viewer;

    var _self = this;

    ///////////////////////////////////////////////////////////////////////////
    // load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        Autodesk.ADN.Viewing.Extension.AdnPropertyPanel = function (viewer) {

            var _panel = this;

            var _viewer = viewer;

            var _selectedNodeId = '';

            Autodesk.Viewing.Extensions.ViewerPropertyPanel.call(
                _panel,
                _viewer);

            _panel.setNodeProperties = function(nodeId) {

                Autodesk.Viewing.Extensions.ViewerPropertyPanel.
                    prototype.setNodeProperties.call(
                        _panel,
                        nodeId);

                _selectedNodeId = nodeId;
            };

            _panel.setProperties = function (properties) {

                Autodesk.Viewing.Extensions.ViewerPropertyPanel.
                    prototype.setProperties.call(
                    _panel, properties);

                _panel.addProperty(
                    "Node Id",          //property name
                    _selectedNodeId,    //property value
                    "Customization");   //group name

                _self.GetQuoteData(function(response){

                    response.quotes.forEach(function(quote){

                        _panel.addProperty(
                            quote.symbol,
                            '$' + quote.LastTradePriceOnly,
                            "Stocks");
                    })
                })
            };
        };

        Autodesk.ADN.Viewing.Extension.AdnPropertyPanel.prototype =
            Object.create(
                Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype);

        Autodesk.ADN.Viewing.Extension.AdnPropertyPanel.prototype.constructor =
            Autodesk.ADN.Viewing.Extension.AdnPropertyPanel;

        var panel = new Autodesk.ADN.Viewing.Extension.AdnPropertyPanel(
            _viewer);

        _viewer.setPropertyPanel(panel);

        console.log("Autodesk.ADN.Viewing.Extension.PropertyPanel loaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        _viewer.setPropertyPanel(null);

        console.log("Autodesk.ADN.Viewing.Extension.PropertyPanel unloaded");

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // get stock market quotes from Yahoo
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.GetQuoteData = function(onSuccess) {

        var url = 'http://query.yahooapis.com/v1/public/yql' +
            '?format=json' +
            '&env=http://datatables.org/alltables.env' +
            '&q='

        var query = 'select * from yahoo.finance.quotes where symbol in ' +
            '("AAPL", "ADSK","FB", "GOOG", "MSFT")';

        url += encodeURIComponent(query);

        $.getJSON(url, function(data){

            var response = {
                quotes : data.query.results.quote
            }

            onSuccess(response);
        });
    }
};

Autodesk.ADN.Viewing.Extension.PropertyPanel.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.PropertyPanel.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.PropertyPanel;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.PropertyPanel',
    Autodesk.ADN.Viewing.Extension.PropertyPanel);