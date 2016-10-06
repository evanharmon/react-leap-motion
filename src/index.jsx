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


// Canvas Size built off rectangle LENGTH
const LENGTH = 130;
const WIDTH = 10;
const CANVAS = {
  X: LENGTH * 2,
  Y: LENGTH * 2
};
// half values allow accessing middle of object for rotate
const PNTS = {
  LENGTH: LENGTH,
  HALF_LENGTH: LENGTH / 2,
  WIDTH: WIDTH,
  HALF_WIDTH: WIDTH / 2,
  X: LENGTH - (LENGTH / 2),
  Y: LENGTH - (WIDTH / 2)
};

// REACT COMPONENTS
class Hand extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pnts: PNTS,
      angle: {
        r: 0
      }
    };

    this.onClickRotate = this.onClickRotate.bind(this);
    this.draw = this.draw.bind(this);
    this.rotateRect = this.rotateRect.bind(this);
    this.drawRectAngle = this.drawRectAngle.bind(this);
  }

  componentDidMount() {
    this.ctx = this.refs.canvas.getContext('2d');
    this.draw(this.ctx);
  }

  render() {
    return (
      <li style={{ display: 'inline-block' }}>
       <div style={{ display: 'flex', alignItems: 'center'}}>
          <div style={{ maxWidth: '25%', alignSelf: 'flex-start'}}>
            <button onClick={() => {
              this.onClickRotate();
            }}>Rotate
            </button>
         </div>
         <div style={{ maxWidth: '75%', marginLeft: '50px' }}>
           <canvas
             style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: 'blue'}}
             ref="canvas"
             width={CANVAS.X}
             height={CANVAS.Y}
           >
         </canvas>
         </div>
       </div>
     </li>
    );
  }
  // CANVAS FUNCTIONS
  draw() {
    // initial draw
    this.ctx.beginPath();
    this.ctx.rect(PNTS.X, PNTS.Y, PNTS.LENGTH, PNTS.WIDTH);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  rotateRect() {
    this.ctx.save();
    // move origin
    this.ctx.translate(this.state.pnts.X, this.state.pnts.Y);
    // move to center of object
    this.ctx.translate(this.state.pnts.HALF_LENGTH, this.state.pnts.HALF_WIDTH);
    const r = this.state.angle.r + 0.1;
    this.setState({
      angle: {
        r: this.state.angle.r + 0.1
      }
    });
    this.ctx.rotate(r);
  }

  drawRectAngle() {
    // draw image up/left, half-size of object to keep center
    this.ctx.rect(-(this.state.pnts.HALF_LENGTH), -(this.state.pnts.HALF_WIDTH), this.state.pnts.LENGTH, this.state.pnts.WIDTH);
    this.ctx.stroke();
  }

  onClickRotate() {
    this.ctx.clearRect(0, 0, CANVAS.X, CANVAS.Y);
    this.ctx.beginPath();

    this.rotateRect();
    this.drawRectAngle();

    this.ctx.restore();
    this.ctx.closePath();
  }
}

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
        frame: null,
        hands: [],
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
        <ul>
          <li style={{ display: 'inline' }}>Hand 1</li>
          <li style={{ display: 'inline' }}>Hand 2</li>
        </ul>
        { this.state.leap.connected
          ? <h2>Connected</h2>
          : <h2>Disconnected</h2> }
        { this.state.leap.streaming
          ? <h2>Streaming</h2>
          : <h2></h2> }
        { this.state.leap.handsLength
          ? <h2>{this.state.leap.handsLength}</h2>
          : <h2></h2> }
          {/* Display for Hands */}
          <ul style={{ listStyle: 'none' }}>
            { this.state.leap.handsLength > 0
              ? this.state.leap.hands.map((h) => {
                return (
                  <Hand key={h.id} />
                );
              })
              : <h2></h2> }
          </ul>
      </div>
    );
  }
  onStart() {
    leapCtrlr.on('connect', () => {
      this.setState({
        leap: { connected: true }
      });
      this.onDeviceStreaming();
      this.onFrame();
    });
    leapCtrlr.connect();
  }
  onStop() {
    leapCtrlr.on('disconnect', () => {
      this.setState({
        leap: { connected: false }
      });
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
          frame: frame,
          hands: frame.hands,
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
