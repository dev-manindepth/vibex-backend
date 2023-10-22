import { notificationQueue } from '@service/queues/notification.queue';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class Delete {
  public async notification(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    notificationQueue.addNotificationJob('deleteNotification', { notificationId });
    res.status(HTTP_STATUS.OK).json({ message: 'Notification deleted' });
  }
}
