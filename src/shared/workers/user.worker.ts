import { config } from '@root/config';
import { userService } from '@service/db/user.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('userWorker');
class UserWorker {
  async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await userService.createUser(value);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
  async updateUserInfo(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await userService.updateUserInfo(key, value);
      done(null, job.data);
      job.progress(100);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
  async updateSocialLinks(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await userService.updateSocialLinksInDB(key, value);
      job.progress(100);
      done(null,job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
