///////////////////////////////////////////////////////////////////////////////
// Property List Panel viewer extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.PropertyListPanel = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    var _panel = null;

    var _viewer = viewer;

    _self.load = function () {

        Autodesk.ADN.AdnPanel = function(
            parentContainer,
            id,
            title,
            options)
        {
            Autodesk.Viewing.UI.PropertyPanel.call(
                this,
                parentContainer,
                id, title);
        };

        Autodesk.ADN.AdnPanel.prototype = Object.create(
            Autodesk.Viewing.UI.PropertyPanel.prototype);

        Autodesk.ADN.AdnPanel.prototype.constructor =
            Autodesk.ADN.AdnPanel;

        _panel = new Autodesk.ADN.AdnPanel(
            _viewer.container,
            'AdnPropStockPanelId',
            'Property List Panel');

        _self.GetQuoteData(function(response){

            var properties = [];

            response.quotes.forEach(function(quote){

                properties.push({

                    displayCategory: "Stocks",
                    displayName: quote.symbol,
                    displayValue: quote.LastTradePriceOnly,
                    hidden: 0,
                    type: 20,
                    units: null
                });
            });

            _panel.setProperties(properties);
        });

        _panel.setVisible(true);

        console.log('Autodesk.ADN.Viewing.Extension.PropertyListPanel loaded');

        return true;
    };

    _self.unload = function () {

        _panel.setVisible(false);

        _panel.uninitialize();

        console.log('Autodesk.ADN.Viewing.Extension.PropertyListPanel unloaded');

        return true;
    };

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

Autodesk.ADN.Viewing.Extension.PropertyListPanel.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.PropertyListPanel.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.PropertyListPanel;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.PropertyListPanel',
    Autodesk.ADN.Viewing.Extension.PropertyListPanel);

