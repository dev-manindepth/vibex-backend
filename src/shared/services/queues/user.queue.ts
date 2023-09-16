import { userWorker } from '@root/shared/workers/user.worker';
import { BaseQueue } from '@service/queues/base.queue';

class UserQueue extends BaseQueue {
  constructor() {
    super('auth');
    console.log('testing when it is called')
    this.processJob('addUserToDB', 5, userWorker.addUserToDB);
  }
  public addUserJob(name: string, data: any): void {
    this.addJob(name, data);
  }
}
export const userQueue: UserQueue = new UserQueue();
