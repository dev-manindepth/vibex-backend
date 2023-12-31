import { config } from '@root/config';
import { postService } from '@service/db/post.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('postWorker');
class PostWorker {
  public async savePostToDB(job: Job, done: DoneCallback) {
    try {
      const { userId, createdPost } = job.data;
      await postService.addPostToDB(userId, createdPost);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
  public async updatePostInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { postId, updatedPost } = job.data;
      await postService.updatePostInDB(postId, updatedPost);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
  public async deletePostFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { postId, userId } = job.data;
      await postService.deletePostFromDB(postId, userId);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}
export const postWorker: PostWorker = new PostWorker();
