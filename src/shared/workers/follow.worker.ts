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
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      done(err as Error);
      log.error(err);
    }
  }
  public async removeFollowerFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, followeeId } = job.data;
      await followService.removeFollowerFromDB(userId, followeeId);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}

export const followWorker: FollowWorker = new FollowWorker();
