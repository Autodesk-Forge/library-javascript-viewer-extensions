/////////////////////////////////////////////////////////////////
// ExtensionManager
//
/////////////////////////////////////////////////////////////////
import ExtensionManagerPanel from './Viewing.Extension.ExtensionManager.Panel';
import ExtensionBase from 'Viewer.ExtensionBase';
import ViewerToolkit from 'Viewer.Toolkit';
import Debug from 'debug';

var debug = Debug('Viewing.Extension.ExtensionManager');

////////////////////////////////////////////////////////////////
// ExtensionManager API
//
/////////////////////////////////////////////////////////////////
class ExtensionManagerAPI {

    constructor(apiUrl) {

        this._apiUrl = apiUrl;
    }

    getExtensions() {

        var url = this._apiUrl + '/extensions';

        return new Promise(
            function (resolve, reject) {
                $.get(url, function (response) {
                    resolve(response);
                });
            });
    }

    getScriptUrl(extension) {

        var url = this._apiUrl + '/extensions/script/' +
            extension.id;

        return url;
    }
}

class ExtensionManager extends ExtensionBase {

    /////////////////////////////////////////////////////////////////
    // Class constructor
    //
    /////////////////////////////////////////////////////////////////
    constructor(viewer, options) {

        super (viewer, options)

        this._api = new ExtensionManagerAPI(
            options.apiUrl);

        this._options.enabledList = options.enabledList || [];

        this._options.defaultOptions = options.defaultOptions || {};

        if(this._options.storage.enabled) {

            this._storedExtensions = this._options.storage.Lockr.get(
                this._options.storage.key) || {};
        }
    }

    /////////////////////////////////////////////////////////////////
    // Extension Id
    //
    /////////////////////////////////////////////////////////////////
    static get ExtensionId() {

        return '_Viewing.Extension.ExtensionManager';
    }

    /////////////////////////////////////////////////////////////////
    // Load callback
    //
    /////////////////////////////////////////////////////////////////
    load() {

        this._extensionsMap = {};

        this.loadManagedExtension.bind(this);
        this.unloadManagedExtension.bind(this);

        this._viewer.loadManagedExtension = (id, options)=> {

            if(this._extensionsMap[id]) {

                return this.loadManagedExtension(
                    this._extensionsMap[id],
                    options);
            }
        }

        this._viewer.unloadManagedExtension = (id)=> {

            if(this._extensionsMap[id]) {

                return this.unloadManagedExtension(
                    this._extensionsMap[id]);
            }
        }

        if(this._options.visible) {

            this._control = ViewerToolkit.createButton(
                'extension-manager-control',
                'glyphicon glyphicon-plus',
                'Manage Extensions', ()=>{

                    this._panel.toggleVisibility();
                });

            this._panel = new ExtensionManagerPanel(
                this._viewer.container,
                this._control.container);

            this._panel.on('load-request',
                this.onLoadRequest.bind(this));

            this._panel.on('unload-request',
                this.onUnloadRequest.bind(this));

            var viewerToolbar = this._viewer.getToolbar(true)

            viewerToolbar.addControl(this._options.parentControl)

            this._options.parentControl.addControl(
                this._control);
        }

        this._eventsMap = {};

        this._loadingQueue = [];

        this._options.waitEventsList.forEach((event)=>{

            this._eventsMap[event] = false;

            var handler = ()=>{

                this._viewer.removeEventListener(
                    event, handler);

                this._eventsMap[event] = true;

                this._loadingQueue.forEach((loadInfo, idx, arr)=>{

                    var load = true;

                    loadInfo.waitEvents.forEach((waitEvent)=>{

                        if(!this._eventsMap[waitEvent])
                            load = false;
                    });

                    if(load && loadInfo.resolve) {
                        loadInfo.resolve();
                        loadInfo.resolve = null;
                    }
                });
            }

            this._viewer.addEventListener(
                event, handler);
        });

        this._api.getExtensions().then((extensions)=>{

            this.initializeExtensions(extensions);
        });

        return true;
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    initializeExtensions(extensions) {

        var loadTasks = extensions.map((extension)=> {

            this._extensionsMap[extension.id] = extension;

            var enable = false;

            if(this._options.enabledList.indexOf(extension.id) > -1) {

                enable = !this._options.storage.enabled ||
                !this._storedExtensions[extension.id] ||
                this._storedExtensions[extension.id].enabled;
            }
            else {

                enable = this._options.storage.enabled &&
                this._storedExtensions[extension.id] &&
                this._storedExtensions[extension.id].enabled;
            }

            if(enable) {

                return this.loadManagedExtension(extension);
            }

            return Promise.resolve();
        });

        Promise.all(loadTasks).then((results)=>{

            this.emit('allExtensionsLoaded', results)
        })

        var visibleExtensions = extensions.filter((extension)=>{
            return (this._options.showHidden ||
            extension.id.indexOf('_') != 0);
        });

        if(this._options.visible){

            this._panel.loadItems(visibleExtensions);
        }
    }

    /////////////////////////////////////////////////////////////////
    // Unload callback
    //
    /////////////////////////////////////////////////////////////////
    unload() {

        this._options.parentControl.removeControl(
            this._control);

        this._panel.setVisible(false)

        this._panel.off()

        this._panel = null

        return true;
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    async onLoadRequest(extension) {

    try{

        var res = await this.loadManagedExtension(
            extension);
    }
    catch (ex){

    }
}

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    onUnloadRequest(extension) {

        this.unloadManagedExtension(extension);
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    loadManagedExtension(extension, options) {

        return new Promise(async(resolve, reject)=> {

            try {

                if(extension.enabled)
                    return resolve(true);

                var scriptUrl = this._api.getScriptUrl(extension);

            await System.import(scriptUrl);

                var defaultOptions =
                    this._options.defaultOptions[extension.id] || {};

                var options = Object.assign({
                        mobile: ViewerToolkit.mobile
                    },
                    this._options,
                    extension.options,
                    defaultOptions,
                    options);

                var _resolve = ()=> {

                    try {

                        var res = this._viewer.loadExtension(
                            extension.id, options);

                        extension.enabled = res;

                        this.updateStorage(extension);

                        if(this._options.visible)
                            this._panel.updateItem(extension);

                        return resolve(res);
                    }
                    catch (ex){
                        debug(ex);
                        reject(ex);
                    }
                }

                if(options.waitEvents) {

                    for(let event of options.waitEvents){

                        if(!this._eventsMap[event]){

                            this._loadingQueue.push({
                                waitEvents: options.waitEvents,
                                resolve: _resolve
                            });

                            return;
                        }
                    }

                    return _resolve();
                }

                else return _resolve();
            }
            catch(ex) {

                debug(ex);

                reject(ex);
            }
        });
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    unloadManagedExtension(extension) {

        var res = this._viewer.unloadExtension(
            extension.id);

        extension.enabled = false;

        this.updateStorage(extension);

        if(this._options.visible)
            this._panel.updateItem(extension);
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////
    updateStorage(extension) {

        if(this._options.storage.enabled) {

            this._storedExtensions[extension.id] = {
                enabled: extension.enabled
            };

            this._options.storage.Lockr.set(
                this._options.storage.key,
                this._storedExtensions);
        }
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
    ExtensionManager.ExtensionId,
    ExtensionManager);