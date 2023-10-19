import { IFollowerJobData } from '@follow/interfaces/follower.interface';
import { followWorker } from '@root/shared/workers/follow.worker';
import { BaseQueue } from '@service/queues/base.queue';

class FollowQueue extends BaseQueue {
  constructor() {
    super('followQueue');
    this.processJob('addFollowerToDB', 5, followWorker.addFollowerToDB);
  }
  public addFollowJob(name:string,data:IFollowerJobData){
    this.addJob(name,data);
  }
}

export const followQueue: FollowQueue = new FollowQueue();
