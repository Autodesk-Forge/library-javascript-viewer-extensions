
import ToolPanelBase from 'ToolPanelBase'
import ReactDOM from 'react-dom'
import React from 'react'
import App from './app'
import './style.css'

export default class ReactPanel extends ToolPanelBase {

  /////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////
  constructor(viewer) {
    
    super(viewer.container, 'React Panel');

    $(this.container).addClass(
      'react-demo-panel');

    ReactDOM.render(<App/>, this.content);
  }
}