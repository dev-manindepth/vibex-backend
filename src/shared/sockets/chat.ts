import { Server } from 'socket.io';

export let socketIOChatObject: Server;
export class ChatSocketIO {
  public listen(io: Server) {
    socketIOChatObject = io;
  }
}
