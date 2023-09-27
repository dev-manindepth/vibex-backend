import { Server } from 'socket.io';

export let socketIOPostObject: Server;

export class PostSocketIO {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOPostObject = io;
  }
  public listen():void{
    
  }
}
