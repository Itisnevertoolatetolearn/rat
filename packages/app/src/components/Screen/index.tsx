import { ScreenChunkTemplate, StreamMessage } from 'app/src/messages/screen';
import * as React from 'react';
import { MenuItem, Nav, Navbar, NavDropdown, NavItem } from 'react-bootstrap';
import { Monitor } from 'shared/system';
import { MessageType } from 'shared/types';
import Client from '../../client';
import withClient from '../../withClient';
import { Subscriber } from '../Subscription';

interface Props {
  client: Client;
}

interface State {
  scale: number;
  running: boolean;
  selectedMonitor: Monitor;
}

class Screen extends React.Component<Props, State> {
  canvas = React.createRef<HTMLCanvasElement>();

  constructor(props) {
    super(props);

    this.state = {
      scale: 0.1,
      running: true,
      selectedMonitor: props.client.monitors[0],
    };
  }

  componentDidMount() {
    this.stream();
  }

  componentWillUnmount() {
    this.stop();
  }

  onReceive = async (message: ScreenChunkTemplate) => {
    const ctx = this.canvas.current.getContext('2d');

    const w = message.width - message.x;
    const h = message.height - message.y;

    const imageData = ctx.getImageData(message.x, message.y, w, h);
    const prevData = new Uint32Array(imageData.data.buffer);
    const xorData = new Uint32Array(message.buffer.buffer.buffer);

    for (let i = 0; i < xorData.length; i++) {
      prevData[i] ^= xorData[i];
    }

    ctx.putImageData(imageData, message.x, message.y);
  };

  render() {
    const { scale, running, selectedMonitor } = this.state;

    return (
      <Subscriber type={MessageType.Screen} handler={this.onReceive}>
        <Navbar>
          <Nav>
            <NavItem>Close</NavItem>
            <NavDropdown
              title={
                selectedMonitor
                  ? 'Monitor ' + selectedMonitor.id
                  : 'none selected'
              }
              id={'dropdown-size-medium'}
            >
              {this.props.client.monitors.map(monitor => (
                <MenuItem
                  key={monitor.id}
                  onClick={() => this.selectMonitor(monitor)}
                >
                  {monitor.id + ': ' + monitor.width + 'x' + monitor.height}
                </MenuItem>
              ))}
            </NavDropdown>
            <NavItem>
              <input
                type="range"
                min={1}
                value={scale * 100}
                max={100}
                onChange={e => this.setScale(e.target.valueAsNumber)}
              />
            </NavItem>
            <NavItem onClick={() => this.toggle()}>
              {running ? 'Pause' : 'Start'}
            </NavItem>
          </Nav>
        </Navbar>
        {/* <Stream
          mouse
          keyboard
          data={frame}
          scale={scale}
          client={this.props.client}
        /> */}
        <canvas
          style={{ width: '100%' }}
          ref={this.canvas}
          width={Math.round(selectedMonitor.width * scale)}
          height={Math.round(selectedMonitor.height * scale)}
        />
      </Subscriber>
    );
  }

  private setScale(scale: number) {
    this.setState(
      {
        scale: scale / 100,
      },
      () => {
        this.stop();
        this.stream();
      }
    );
  }

  selectMonitor = (monitor: Monitor) =>
    this.setState(
      {
        selectedMonitor: monitor,
      },
      () => this.stream()
    );

  private toggle() {
    const { running } = this.state;

    if (running) {
      this.stop();
    } else {
      this.stream();
    }
  }

  private stream() {
    const { scale, selectedMonitor } = this.state;

    this.props.client.send(
      new StreamMessage({
        active: true,
        scale,
        monitor: true,
        id: selectedMonitor.id,
      })
    );

    this.setState({
      running: true,
    });
  }

  private stop() {
    this.props.client.send(
      new StreamMessage({
        active: false,
      })
    );

    this.setState({
      running: false,
    });
  }
}

export default withClient(Screen);
