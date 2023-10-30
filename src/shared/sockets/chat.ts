import { ISenderReceiver } from '@chat/interfaces/chat.interace';
import { Server, Socket } from 'socket.io';
import { connectedUsersMap } from '@socket/user';

export let socketIOChatObject: Server;
export class ChatSocketIO {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOChatObject = io;
  }
  public listen() {
    this.io.on('connection', (socket: Socket) => {
      socket.on('join room', (users: ISenderReceiver) => {
        const { senderName, receiverName } = users;
        const senderSocketId: string = connectedUsersMap.get(senderName) as string;
        const receiverSocketId: string = connectedUsersMap.get(receiverName) as string;
        socket.join(senderSocketId);
        socket.join(receiverSocketId);
      });
    });
  }
}
