/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.Riot
// by Philippe Leefsma, January 2016
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Riot = function (viewer, options) {
  
  Autodesk.Viewing.Extension.call(this, viewer, options);
  
  var _thisExtension = this;

  var _panel = null;

  /////////////////////////////////////////////////////////////////
  // Extension load callback
  //
  /////////////////////////////////////////////////////////////////
  _thisExtension.load = function () {

    var dependencies = [
      "uploads/extensions/Autodesk.ADN.Viewing.Extension.Riot/riot.min.js"
    ];

    //Dynamic dependency loading with RequireJS
    require(dependencies, function() {

      _panel = new Panel(
        viewer.container,
        guid());

      _panel.setVisible(true);

      console.log('Autodesk.ADN.Viewing.Extension.Riot loaded');
    });
    
    return true;
  }
  
  /////////////////////////////////////////////////////////////////
  //  Extension unload callback
  //
  /////////////////////////////////////////////////////////////////
  _thisExtension.unload = function () {
    
    _panel.setVisible(false);

    _panel.unload();
    
    console.log('Autodesk.ADN.Viewing.Extension.Riot unloaded');
    
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
  
  ///////////////////////////////////////////////////////////////////////////
  // Example REST API using promises to get/store Items
  // (not used in this demo)
  //
  ///////////////////////////////////////////////////////////////////////////
  var API = {
    
    //response: item
    getItem: function(modelId, itemId) {
      
      var url = options.apiUrl + '/' +
        modelId + '/item/' + itemId;
      
      return new Promise(
        function (resolve, reject) {
          $.get(url, function (response) {
            resolve(response);
          });
        });
    },
    
    //response: item []
    getItems: function(modelId) {
      
      var url = options.apiUrl + '/' + modelId;

      return new Promise(
        function (resolve, reject) {
          $.get(url, function (response) {
            resolve(response);
          });
        });
    },
    
    //response: item
    putItem: function (modelId, item) {
      
      var url = options.apiUrl + '/' +
        modelId;
      
      var payload = {
        item: JSON.stringify(item)
      };
      
      return new Promise(
        function (resolve, reject) {
          
          $.ajax({
            
            url: url,
            type: 'PUT',
            data: payload,
            
            success: function (response) {
              
              resolve(response);
            },
            error: function (error) {
              console.log('PUT Item failed:');
              console.log(error);
              reject(error);
            }
          });
        })
    },
    
    //response: item
    deleteItem: function (modelId, itemId) {
      
      var url = options.apiUrl + '/' +
        modelId + '/' + itemId +
        '/delete';
      
      return new Promise(
        function (resolve, reject) {
          
          $.ajax({
            
            url: url,
            type: 'POST',
            
            success: function (response) {
              
              resolve(response);
            },
            error: function (error) {
              console.log('DELETE Item failed:');
              console.log(error);
              reject(error);
            }
          });
        });
    }
  }
  
  /////////////////////////////////////////////////////////////////
  // The demo Panel
  //
  /////////////////////////////////////////////////////////////////
  var Panel = function(
    parentContainer, id) {
    
    var _thisPanel = this;

    /////////////////////////////////////////////////////////////////
    // Riot Dispatcher
    //
    /////////////////////////////////////////////////////////////////
    var Dispatcher = function() {

      this._stores = [];

      this.addStore = function(store) {
        this._stores.push(store)
      }

      this.trigger = function() {

        let args = [].slice.call(arguments);

        this._stores.forEach(function(el) {
          el.trigger.apply(null, args)
        })
      }

      this.on = function(ev, cb) {
        this._stores.forEach(function(el) {
          el.on(ev, cb)
        })
      }

      this.off = function(ev, cb) {
        this._stores.forEach(function(el) {
          if (cb)
            el.off(ev, cb);
          else
            el.off(ev)
        })
      }

      this.one = function(ev, cb) {
        this._stores.forEach(function(el) {
          el.one(ev, cb)
        })
      }
    }

    /////////////////////////////////////////////////////////////////
    // The Item Store
    //
    /////////////////////////////////////////////////////////////////
    var ItemStore = function(dispatcher) {

      var _thisStore = this;

      _thisStore.items = [];

      riot.observable(_thisStore);

      dispatcher.addStore(_thisStore);

      _thisStore.on('CREATE_ITEM', (item) => {

        _thisStore.items.push(item);

        _thisStore.trigger(
          'UPDATE_ITEMS',
          _thisStore.items);
      });

      _thisStore.on('DELETE_ITEM', (id) => {

        _thisStore.items = _thisStore.items.filter((item)=>{
          return (item.id !== id)
        });

        _thisStore.trigger(
          'UPDATE_ITEMS',
          _thisStore.items);
      });
    }

    /////////////////////////////////////////////////////////////////
    // Defines Riot Tags
    //
    /////////////////////////////////////////////////////////////////
    function defineComponents(dispatcher, stores) {
      
      ///////////////////////////////////////////////////////////////
      // <create-item-button> Tag
      //
      ///////////////////////////////////////////////////////////////
      riot.tag('create-item-button',

        `<button onclick={createItem}
               class="btn btn-info btn-riot-demo">
            <span class="glyphicon glyphicon-plus span-riot-demo">
            </span>
            Create Item
          </button>
        `,

        function(opts) {

          let _thisComponent = this;

          _thisComponent.createItem = function(e) {

            dispatcher.trigger('REQUEST_NEW_ITEM_NAME');
          }
        }
      );

      ///////////////////////////////////////////////////////////////
      // <input-item-name> Tag
      //
      ///////////////////////////////////////////////////////////////
      riot.tag('input-item-name',

        ` <input type="text"
            class="riot-demo-name"
            placeholder=" Link name ...">
        `,

        function(opts) {

          let _thisComponent = this;

          stores.ItemStore.on('REQUEST_NEW_ITEM_NAME', ()=> {

            var input = _thisComponent.root.children[0];

            var item = {

              id: guid(),

              name: (input.value.length ? input.value :
                (new Date().toString('d/M/yyyy H:mm:ss')).
                  split('GMT')[0])
            };

            input.value = '';

            dispatcher.trigger('CREATE_ITEM', item);
          });
        }
      );

      ///////////////////////////////////////////////////////////////
      // <controls-container> Tag
      //
      ///////////////////////////////////////////////////////////////
      riot.tag('controls-container',

        `<div class="riot-demo-controls">

          <create-item-button>
          </create-item-button>

          <input-item-name>
          </input-item-name>

        </div>
        `,

        function(opts) {

          let _thisComponent = this;
        }
      );

      ///////////////////////////////////////////////////////////////
      // <item> Tag
      //
      ///////////////////////////////////////////////////////////////
      riot.tag('item',

        `<div class="list-group-item riot-demo-item"
            onclick={itemClicked}>

          {opts.name}

          <button class="btn btn-danger btn-riot-demo-item"
                  onclick={itemDelete}>
            <span class="glyphicon glyphicon-remove-sign span-item-riot-demo">
            </span>
          </button>

          <button class="btn btn-success btn-riot-demo-item"
                  style="margin-right: 4px;"
                  onclick={itemInfo}>
            <span class="glyphicon glyphicon-info-sign span-item-riot-demo">
            </span>
          </button>

        </div>
        `,

        function(opts) {

          let _thisComponent = this;

          _thisComponent.itemClicked = (e)=>{

            var element = document.elementFromPoint(
              e.pageX,
              e.pageY);

            if(element.className.indexOf('riot-demo-item') > -1) {

              alert('Item Clicked: ' + opts.name);
            }
          }

          _thisComponent.itemInfo = (e)=>{

            e.preventDefault();

            alert('Item Info: ' + opts.name);
          }

          _thisComponent.itemDelete = (e)=>{

            _thisComponent.itemClicked = (e)=>{};

            dispatcher.trigger('DELETE_ITEM', opts.id);

            _thisComponent.update();
          }
        }
      );

      ///////////////////////////////////////////////////////////////
      // <'item-list> Tag
      //
      ///////////////////////////////////////////////////////////////
      riot.tag('item-list',

        `<div class="riot-demo-item-list">
          <item each={items} name="{name}" id="{id}"> </item>
        </div>
        `,

        function(opts) {

          let _thisComponent = this;

          _thisComponent.items = [];

          stores.ItemStore.on('UPDATE_ITEMS', (items)=> {

            _thisComponent.items = items;

            _thisComponent.update();
          });

          function componentMounted(){

            dispatcher.trigger('CLEAR_ITEMS');
          }

          _thisComponent.on('mount', () => componentMounted());
        }
      );

      ///////////////////////////////////////////////////////////////
      // <panel-container> Tag
      //
      ///////////////////////////////////////////////////////////////
      riot.tag('panel-container',

        `<controls-container>
        </controls-container>

        <item-list>
        </item-list>
        `,

        function(opts) {

          let _thisComponent = this;

          stores.ItemStore.on('UNMOUNT', ()=> {

            _thisComponent.unmount();
          });
        }
      );
    }

    /////////////////////////////////////////////////////////////
    // Riot elements
    //
    /////////////////////////////////////////////////////////////
    var _dispatcher = new Dispatcher();

    var _itemStore = new ItemStore(_dispatcher);

    defineComponents(_dispatcher, {
      ItemStore: _itemStore
    });

    _thisPanel.content = document.createElement(
      'panel-container');

    Autodesk.Viewing.UI.DockingPanel.call(
      this,
      parentContainer,
      id,
      'Riot Panel Demo',
      {shadow:true});

    _thisPanel.container.classList.add(
      'riot-demo-panel');

    riot.mount('panel-container');

    /////////////////////////////////////////////////////////////
    // setVisible override
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.isVisible = false;

    _thisPanel.setVisible = function(show) {
      
      _thisPanel.isVisible = show;
      
      Autodesk.Viewing.UI.DockingPanel.prototype.
        setVisible.call(this, show);
    }
    
    /////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.toggleVisibility = function() {
      
      _panel.setVisible(!_thisPanel.isVisible);
    }
    
    /////////////////////////////////////////////////////////////
    // onTitleDoubleClick override
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.onTitleDoubleClick = function (event) {

      _thisPanel.container.classList.toggle(
        'riot-demo-minimized');
    }

    /////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////
    _thisPanel.unload = function() {

      _dispatcher.trigger('UNMOUNT');
    }
  }
  
  /////////////////////////////////////////////////////////////
  // Set up JS inheritance
  //
  /////////////////////////////////////////////////////////////
  Panel.prototype = Object.create(
    Autodesk.Viewing.UI.DockingPanel.prototype);
  
  Panel.prototype.constructor = Panel;
  
  Panel.prototype.initialize = function() {
    
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
  // Add needed CSS
  //
  /////////////////////////////////////////////////////////////
  function insertCss(css) {

    var style = document.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet) {
      // IE
      style.styleSheet.cssText = css;

    } else {

      // Other browsers
      style.innerHTML = css;
    }

    document.getElementsByTagName("head")[0].appendChild(style);
  }
  
  /////////////////////////////////////////////////////////////
  // Add needed CSS
  //
  /////////////////////////////////////////////////////////////
  var css = `

    div.riot-demo-panel {
      top: 0px;
      right: 0px;
      min-width: 310px;
      min-height: 250px;
      resize: auto;
    }

    button.btn-riot-demo {
      height: 12px;
      line-height: 0;
    }

    button.btn-riot-demo-item {
      height: 8px;
      float: right;
    }

    .span-riot-demo {
      line-height: 0;
      top: 1px;
    }

    .span-item-riot-demo {
      top: -3px;
    }

    .riot-demo-controls{
      margin-left: 4px;
      margin-top: 4px;
      padding-bottom: 4px;
    }

    input.riot-demo-name {
      height: 20px;
      border-radius:5px;
      vertical-align: top;
      width: calc(100% - 130px);
    }

    div.riot-demo-minimized {
      height: 34px;
      min-height: 34px
    }

    .riot-demo-item-list {
      padding-left: 4px;
      padding-right: 4px;
      height: calc(100% - 76px);
      overflow-y: scroll;
    }

    .riot-demo-item:last-child {
      padding-bottom: 4px;
      padding-top: 2px;
      margin-bottom: 3px;
      border-radius: 4px;
      color: #FFFFFF;
      background-color: #908F8F;
    }

    div.riot-demo-item:hover {
      background-color: #5BC0DE;
    }
  `;

  insertCss(css);
};

Autodesk.ADN.Viewing.Extension.Riot.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Riot.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.Riot;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.Riot',
  Autodesk.ADN.Viewing.Extension.Riot);

