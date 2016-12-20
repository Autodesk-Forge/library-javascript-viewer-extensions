///////////////////////////////////////////////////////////////////////////////
// viewer extension enable SEO
// by Daniel Du
// This extension ouputs the properties values into a hidden div tag
// so that the properties can be indexed by search engine
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.SEO = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _self = this;

    _self.load = function () {

        console.log('Autodesk.ADN.Viewing.Extension.SEO loaded');

        viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, 
            function(event){

                var pagemapDiv = $('<div></div>').appendTo('body');
                pagemapDiv.hide();

                pagemapDiv.attr('id','pageMap');
                pagemapDiv.addClass('class_name');

                var pageMapTag = $('<PageMap></PageMap>').appendTo(pagemapDiv);
                var objectDataTag = $('<DataObject></DataObject>').appendTo(pageMapTag);
                objectDataTag.attr('type','document');
                


                viewer.getAllLeafComponents(function(components){
                    for (var i = components.length - 1; i >= 0; i--) {
                        var comp = components[i];
                            //console.log(comp);
                            var dbId = comp.dbId;

                            viewer.getProperties(dbId,function(result){
                                if (result.properties) {

                                    var pageMapAttr = '';

                                    for (var i = 0; i < result.properties.length; i++) {

                                        var prop = result.properties[i];
                                        pageMapAttr = pageMapAttr + '<Attribute name="'+prop.displayName+'">'+prop.displayValue+'</Attribute>\n';
                                        
                                    }//for

                                    $('DataObject').append(pageMapAttr);


                                   
                                }//if

                            });

                    };//for

                    // //add comment tag for pagedata

                    // $('#pageMap').text($('#pageMap').text().replace('<PageMap>','<!-- <PageMap>'));
                    // $('#pageMap').text($('#pageMap').text().replace('</PageMap>','<PageMap> -->'));


                }); // viewer.getAllLeafComponents callback

            });//viewer.addEventListener callback

        return true;
    };

    _self.unload = function () {

        viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT);
        console.log('Autodesk.ADN.Viewing.Extension.SEO unloaded');
        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // Get all leaf components
    //
    ///////////////////////////////////////////////////////////////////////////
    Autodesk.Viewing.Viewer.prototype.getAllLeafComponents =

        function (callback) {

            function getLeafComponentsRec(parent) {

                var components = [];

                if (typeof parent.children !== "undefined") {

                    var children = parent.children;

                    for (var i = 0; i < children.length; i++) {

                        var child = children[i];

                        if (typeof child.children !== "undefined") {

                            var subComps = getLeafComponentsRec(child);

                            components.push.apply(components, subComps);
                        }
                        else {
                            components.push(child);
                        }
                    }
                }

                return components;
            }

            this.getObjectTree(function (result) {

                var allLeafComponents = getLeafComponentsRec(result);

                callback(allLeafComponents);
            });
        };




};

Autodesk.ADN.Viewing.Extension.SEO.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.SEO.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.SEO;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.SEO',
    Autodesk.ADN.Viewing.Extension.SEO);