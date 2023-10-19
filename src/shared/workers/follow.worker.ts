import { config } from '@root/config';
import { followService } from '@service/db/follow.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('followWorker');
class FollowWorker {
  public async addFollowerToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, followeeId, username, followerDocumentId } = job.data;
      await followService.addFollowerToDB(userId, followeeId, username, followerDocumentId);
    } catch (err) {
      done(err as Error);
      log.error(err);
    }
  }
}

export const followWorker: FollowWorker = new FollowWorker();
