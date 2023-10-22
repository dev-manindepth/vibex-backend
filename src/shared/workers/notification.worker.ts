import { config } from '@root/config';
import { notificationService } from '@service/db/notification.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('notificationWorker');
class NotificationWorker {
  public async updateNotification(job: Job, done: DoneCallback) {
    try {
      const { notificationId } = job.data;
      await notificationService.updateNotification(notificationId);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
  public async deleteNotification(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { notificationId } = job.data;
      await notificationService.deleteNotification(notificationId);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}
export const notificationWorker: NotificationWorker = new NotificationWorker();
