import { IReactionJob } from '@root/features/reactions/interfaces/reaction.interface';
import { reactionWorker } from '@root/shared/workers/reaction.worker';
import { BaseQueue } from '@service/queues/base.queue';

class ReactionQueue extends BaseQueue {
  constructor() {
    super('reactions');
    this.processJob('addReactionToDB', 5, reactionWorker.addReactionToDB);
  }
  public async addReactionJob(name: string, data: IReactionJob) {
    this.addJob(name, data);
  }
}

export const reactionQueue: ReactionQueue = new ReactionQueue();
