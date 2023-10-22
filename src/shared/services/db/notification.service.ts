import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { NotificationModel } from '@notification/models/notification.model';
import mongoose from 'mongoose';

class NotificationService {
  public async getNotification(userId: string): Promise<INotificationDocument[]> {
    const notifications: INotificationDocument[] = await NotificationModel.aggregate([
      {
        $match: { userTo: new mongoose.Types.ObjectId(userId) }
      },
      {
        $lookup: { from: 'User', localField: 'userFrom', foreignField: '_id', as: 'userFrom' }
      },
      {
        $unwind: '$userFrom'
      },
      {
        $lookup: { from: 'Auth', localField: 'userFrom.authId', foreignField: '_id', as: 'authUser' }
      },
      {
        $unwind: '$authUser'
      },
      {
        $project: {
          _id: 1,
          message: 1,
          comment: 1,
          createdAt: 1,
          createdItemId: 1,
          entityId: 1,
          notificationType: 1,
          gifUrl: 1,
          imgId: 1,
          imgVersion: 1,
          post: 1,
          reaction: 1,
          read: 1,
          userTo: 1,
          userFrom: {
            profilePicture: '$userFrom.profilePicture',
            username: '$authUser.username',
            avatarColor: '$authUser.avatarColor',
            uId: '$authUser.uId'
          }
        }
      }
    ]);
    return notifications;
  }
  public async updateNotification(notificationId: string) {
    await NotificationModel.updateOne({ _id: notificationId }, { $set: { read: true } });
  }
}

export const notificationService: NotificationService = new NotificationService();
