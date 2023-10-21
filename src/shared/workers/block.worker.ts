import { config } from '@root/config';
import { blockService } from '@service/db/block.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('blockWorker');
class BlockWorker {
  public async addBlockUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, userToBlockOrUnblockId, type } = job.data;
      if (type == 'block') {
        await blockService.block(userId, userToBlockOrUnblockId);
      } else if (type == 'unblock') {
        await blockService.unblock(userId, userToBlockOrUnblockId);
      }
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}
export const blockWorker: BlockWorker = new BlockWorker();
