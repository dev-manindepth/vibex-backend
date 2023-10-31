import { Server } from 'socket.io';

export let socketIONotificationObject: Server;

export class NotificationSocketIO {
  public listen(io: Server): void {
    socketIONotificationObject = io;
  }
}
