import { ClientTemplate, ClientUpdateType } from '../../../shared/src/templates';
import Client from '../client';
import Connections from '../components/Clients';
import ControlSocket from '../control';
import MessageHandler from './index';

class ClientHandler implements MessageHandler<ClientTemplate> {

  constructor(private view: Connections) {

  }

  /* tslint:disable:no-shadowed-variable */
  public emit(data: ClientTemplate) {
    switch (data.type) {
      case ClientUpdateType.ADD:
        const client = new Client(data.id, data.host);
        client.update(data);
        ControlSocket.clients.push(client);
        break;
      case ClientUpdateType.UPDATE:
        ControlSocket.clients.filter((client) => {
          if (client.id === data.id) {
            return client;
          }
        }).forEach((client) => {
          client.update(data);
        });
        break;
      case ClientUpdateType.REMOVE:
        ControlSocket.clients = ControlSocket.clients.filter((client) => {
          return client.id !== data.id;
        });
        break;
    }

    this.view.setState({
      clients: ControlSocket.clients
    });
  }
}

export default ClientHandler;
