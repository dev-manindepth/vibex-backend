import { Server } from 'socket.io';

export let socketIOImageObject: Server;
export class ImageSocketIO {
  public listen(io: Server): void {
    socketIOImageObject = io;
  }
}
