import { INotificationJobData } from '@notification/interfaces/notification.interface';
import { notificationWorker } from '@root/shared/workers/notification.worker';
import { BaseQueue } from '@service/queues/base.queue';

class NotificationQueue extends BaseQueue {
  constructor() {
    super('notificationQueue');
    this.processJob('updateNotification',5,notificationWorker.updateNotification);
    this.processJob('deleteNotification', 5, notificationWorker.deleteNotification);
  }
  public async addNotificationJob(name:string,data:INotificationJobData){
    this.addJob(name,data);
  }
}

export const notificationQueue: NotificationQueue = new NotificationQueue();
