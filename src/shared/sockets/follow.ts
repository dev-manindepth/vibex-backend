import { IFollowers } from '@follow/interfaces/follower.interface';
import { Server, Socket } from 'socket.io';

export let socketIOFollowObject: Server;
export class FollowSocketIO {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOFollowObject = io;
  }
  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('unfollow user', (data: IFollowers) => {
        this.io.emit('remove follower', data);
      });
    });
  }
}
