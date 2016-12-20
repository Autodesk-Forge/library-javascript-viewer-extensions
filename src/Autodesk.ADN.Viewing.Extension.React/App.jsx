
import SpinningImg from './SpinningImg'
import logo from './react-logo.png'
import React from 'react'

/////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////
export default class App extends React.Component {

    render() {
      return (
        <div>
          <p>&nbsp;React Rocks!</p>
          <SpinningImg width="256" height="256" src={logo}/>
        </div>
      );
    }
}
