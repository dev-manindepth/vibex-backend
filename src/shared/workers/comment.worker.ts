import { config } from '@root/config';
import { commentService } from '@service/db/comment.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('commentWorker');
class CommentWorker {
  public async addCommentToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { data } = job;
      await commentService.addCommentDataToDB(data);
      done(null, data);
      job.progress(100);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}

export const commentWorker: CommentWorker = new CommentWorker();
