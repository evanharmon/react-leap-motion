import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { is, Map as iMap, List as iList } from 'immutable';
import expect from 'expect';
import Leap from 'leapjs';


const testLeapConnected = () => {
  const leap = new Leap.Controller({
    host: '127.0.0.1',
    port: 6437,
    frameEventName: 'animationFrame',
    useAllPlugins: true
  });

  leap.connect();
  leap.on('connect', () => {
    expect(leap.connected()).toEqual(true);
    leap.disconnect();
  });
};
// testLeapConnected();

const leap = new Leap.Controller({
  host: '127.0.0.1',
  port: 6437,
  frameEventName: 'animationFrame',
  useAllPlugins: true
});
// this app really needs redux in it now - bc it needs to listen for change in
// connect status
class HandsApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      leap: {
        connected: false
      },
      handId: 0
    };
  }
  componentWillUnmount() {
    leap.disconnect();
  }
  render() {
    return (
      <div>
        <h1>Leap Motion</h1>

        <button
          onClick={() => {
            leap.on('connect', () => {
              this.setState({ leap: { connected: true } });
              console.log('connected', leap.connected());
            });
            leap.connect();
          }}
        >Start App</button>
        <button
          onClick={() => {
            leap.on('disconnect', () => {
              this.setState({ leap: { connected: false } });
              console.log('disconnected', leap.connected());
            });
            leap.disconnect();
          }}
        >Stop App</button>
        { this.state.leap.connected ? <h2>Connected</h2> : <h2>Disconnected</h2> }
      </div>
    );
  }
}

const render = () => {
  ReactDOM.render(
    <HandsApp/>,
    document.getElementById('content')
  );
};

render();
console.log('all tests passed');
