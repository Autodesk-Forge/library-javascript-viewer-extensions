/////////////////////////////////////////////////////////////////////
// Viewing.Extension.ExtensionManager.Panel
// by Philippe Leefsma, Feb 2016
//
/////////////////////////////////////////////////////////////////////
import ToolPanelBase from 'ToolPanelBase';

export default class ExtensionManagerPanel extends ToolPanelBase {

  constructor(container, btnElement) {

    super(container, 'Extension Manager', {
      buttonElement: btnElement,
      shadow: true
    });

    $(this.container).addClass('extension-manager');

    $('#' + this.container.id + '-filter').on('input',()=> {

      this.filterItems();
    });
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  htmlContent(id) {

    return `

      <div class="container">
        <input id="${id}-filter" type="text" class="filter"
               placeholder=" Search Extensions ...">
        <div class="item-list" id="${id}-item-list">
        </div>
      </div>`;
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  loadItems(items) {

    $('.extension-manager .list-group-item').remove();

    items.forEach((item)=> {

        this.addItem(item);
    });
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  addItem(extension) {

    const itemId = extension._id

    var itemHtml = `
      <div id="${itemId}" class="list-group-item">
        ${extension.name}
      </div>
    `;

    $(`#${this.container.id}-item-list`).append(itemHtml);

    var $item = $(`#${itemId}`);

    $item.addClass(extension.enabled ? 'enabled' : '');

    $item.click((e)=> {

      e.preventDefault();

      extension.enabled ?
        this.emit('unload-request', extension) :
        this.emit('load-request', extension)
    });
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  updateItem(extension) {

    var $item = $(`#${extension._id}`);

    extension.enabled ?
      $item.addClass('enabled') :
      $item.removeClass('enabled')
  }

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  filterItems() {

    var filter = $('#' + this.container.id + '-filter').val();

    $(".extension-manager .list-group-item").each(function() {

      var $item = $(this);

      if(!filter.length ||
        $item.text().toLowerCase().indexOf(
          filter.toLowerCase()) > 0) {

        $item.css({
          'display':'block'
        });
      }
      else {

        $item.css({
          'display':'none'
        });
      }
    });
  }
}

/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
var css = `

.extension-manager {
  top: 10px;
  right: 10px;
  width: 250px;
  height: 350px;
  resize: auto;
}

.extension-manager .container {
  height: calc(100% - 55px);
  width: calc(100% - 18px);
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
  margin: 0;
  overflow: auto;
}

.extension-manager .item-list {
    height: calc(100% - 30px);
    overflow: auto;
}

.extension-manager .v-spacer {
  border-width: 0px;
  margin: 2px;
}

.extension-manager .v-spacer-large {
  border-width: 0px;
  margin: 5px;
}

.extension-manager .list-group-item {
  width: calc(100% - 20px);
  height: 4px;
  line-height: 0.3;
  border-radius: 4px;
  margin-top: 0px;
  margin-bottom: 2px;
  padding-right: 2px;
  background-color: #E8E8E8;
  border: 1px solid #000;
  cursor: pointer;
}

.extension-manager .list-group-item.enabled {
  background-color: #4FEA5B;
}

.extension-manager .filter {
  background-color: #DEDEDE;
  width: calc(100% - 8px);
  border-radius: 4px;
  margin-bottom: 6px;
}

`;

$('<style type="text/css">' + css + '</style>').appendTo('head');