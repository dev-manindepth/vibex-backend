import { IBlockedUserJobData } from '@follow/interfaces/follower.interface';
import { blockWorker } from '@root/shared/workers/block.worker';
import { BaseQueue } from '@service/queues/base.queue';

class BlockQueue extends BaseQueue {
  constructor() {
    super('blockQueue');
    this.processJob('addBlockedUserToDB', 5, blockWorker.addBlockUserToDB);
    this.processJob('removeBlockedUserFromDB', 5, blockWorker.addBlockUserToDB);
  }
  public async addBlockUnblockJob(name: string, data: IBlockedUserJobData) {
    this.addJob(name, data);
  }
}
export const blockQueue: BlockQueue = new BlockQueue();
