import { IPostJob } from '@post/interfaces/post.interface';
import { postWorker } from '@root/shared/workers/post.worker';
import { BaseQueue } from '@service/queues/base.queue';

class PostQueue extends BaseQueue {
  constructor() {
    super('posts');
    this.processJob('addPostToDB', 5, postWorker.savePostToDB);
  }
  public addPostJob(name: string, data: IPostJob) {
    this.addJob(name, data);
  }
}

export const postQueue: PostQueue = new PostQueue();
