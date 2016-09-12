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
testLeapConnected();

const leapCtrlr = new Leap.Controller({
  host: '127.0.0.1',
  port: 6437,
  frameEventName: 'animationFrame',
  useAllPlugins: true
});

// REDUCERS
const handsReducer = (state = iList(), action) => {
  switch (action.type) {
    case 'ADD':
      return state.push(action.payload);
    default:
      return state;
  }
};

const testAddHand = () => {
  const stateBefore = iList().push(
    iMap({ id: 0 })
  );
  const action = {
    type: 'ADD',
    payload: iMap({ id: 1 })
  };
  const stateAfter = iList().push(
    iMap({ id: 0 }),
    iMap({ id: 1 })
  );
  const newState = handsReducer(stateBefore, action);
  expect(is(stateAfter, newState)).toEqual(true);
};
testAddHand();

const reducers = combineReducers({
  hands: handsReducer
});
const store = createStore(reducers);

// REACT COMPONENTS
const nextHandId = 0;
class HandsApp extends Component {
  constructor(props) {
    super(props);

    this.onStart = this.onStart.bind(this);
    this.onStop = this.onStop.bind(this);
    this.onDeviceStreaming = this.onDeviceStreaming.bind(this);
    this.onFrame = this.onFrame.bind(this);

    this.state = {
      leap: {
        connected: false,
        streaming: false,
        handsLength: 0
      }
    };
  }
  componentWillUnmount() {
    leapCtrlr.disconnect();
  }
  render() {
    return (
      <div>
        <h1>Leap Motion</h1>

        <button
          onClick={() =>
            this.onStart()
          }
        >Start App</button>
        <button
          onClick={() =>
            this.onStop()
          }
        >Stop App</button>
        { this.state.leap.connected
          ? <h2>Connected</h2>
          : <h2>Disconnected</h2> }
        { this.state.leap.streaming
          ? <h2>Streaming</h2>
          : <h2></h2> }
        { this.state.leap.handsLength
          ? <h2>{this.state.leap.handsLength}</h2>
          : <h2></h2> }
      </div>
    );
  }
  onStart() {
    leapCtrlr.on('connect', () => {
      this.setState({ leap: { connected: true } });
      this.onDeviceStreaming();
      this.onFrame();
    });
    leapCtrlr.connect();
  }
  onStop() {
    leapCtrlr.on('disconnect', () => {
      this.setState({ leap: { connected: false } });
    });
    leapCtrlr.disconnect();
  }
  onDeviceStreaming() {
    leapCtrlr.on('deviceStreaming', () => {
      this.setState({
        leap: {
          connected: this.state.leap.connected,
          streaming: true
        }
      });
    });
  }
  onFrame() {
    leapCtrlr.on('frame', frame => {
      this.setState({
        leap: {
          connected: this.state.leap.connected,
          streaming: this.state.leap.streaming,
          handsLength: frame.hands.length
        }
      });
    });
  }
}

const render = () => {
  ReactDOM.render(
    <HandsApp/>,
    document.getElementById('content')
  );
};

render();
store.subscribe(render);
console.log('all tests passed');
