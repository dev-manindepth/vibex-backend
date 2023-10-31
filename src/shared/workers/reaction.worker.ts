import { config } from '@root/config';
import { reactionService } from '@service/db/reaction.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('reactionWorker');
class ReactionWorker {
  public async addReactionToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await reactionService.addReactionDataToDB(data);
      job.progress(100);
      done(null, data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
  public async removeReactionFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const {data} = job;
      await reactionService.removeReactionDataFromDB(data);
      job.progress(100);
      done(null,data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}

export const reactionWorker: ReactionWorker = new ReactionWorker();
