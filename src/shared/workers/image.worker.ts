import { config } from '@root/config';
import { imageService } from '@service/db/image.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('imageWorker');
class ImageWorker {
  public async addUserProfileImageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, url, imgId, imgVersion } = job.data;
      await imageService.addUserProfileImageToDB(userId, url, imgId, imgVersion);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
  public async updateBGImageInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, imgId, imgVersion } = job.data;
      await imageService.addBackgroundImageToDB(userId, imgId, imgVersion);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
  public async addImageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, imgId, imgVersion } = job.data;
      await imageService.addImage(userId, imgId, imgVersion, '');
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
  public async removeImageFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { imageId } = job.data;
      await imageService.removeImageFromDB(imageId);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}
export const imageWorker: ImageWorker = new ImageWorker();
