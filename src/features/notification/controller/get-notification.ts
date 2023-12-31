import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { notificationService } from '@service/db/notification.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class Get {
  public async notification(req: Request, res: Response): Promise<void> {
    const notifications: INotificationDocument[] = await notificationService.getNotification(req.currentUser!.userId);
    res.status(HTTP_STATUS.OK).json({ message: 'All Notifications', notifications });
  }
}
