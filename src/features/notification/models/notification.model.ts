import { INotification, INotificationDocument } from '@notification/interfaces/notification.interface';
import { notificationService } from '@service/db/notification.service';
import mongoose, { Model, Schema, model } from 'mongoose';

const notificationSchema: Schema = new Schema({
  userTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  read: { type: Boolean, default: false },
  message: { type: String, default: '' },
  notificationType: String,
  entityId: mongoose.Types.ObjectId,
  createdItemId: mongoose.Types.ObjectId,
  comment: { type: String, default: '' },
  reaction: { type: String, default: '' },
  post: { type: String, default: '' },
  imgId: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now() }
});

notificationSchema.methods.insertNotification = async function (body: INotification) {
  try {
    await NotificationModel.create(body);
    const notifications: INotificationDocument[] = await notificationService.getNotification(body.userTo);
    return notifications;
  } catch (err) {
    return err;
  }
};
export const NotificationModel: Model<INotificationDocument> = model<INotificationDocument>(
  'Notification',
  notificationSchema,
  'Notification'
);
