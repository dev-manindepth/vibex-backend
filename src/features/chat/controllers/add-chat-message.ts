import { IMessageData, IMessageNotification } from '@chat/interfaces/chat.interace';
import { addChatSchema } from '@chat/schemas/chat.schema';
import { joiValidation } from '@global/decorators/joi-validation-decorators';
import { uploads } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';
import { config } from '@root/config';
import { notificationTemplate } from '@service/emails/templates/notification/notification-template';
import { chatQueue } from '@service/queues/chat.queue';
import { mailQueue } from '@service/queues/email.queue';
import { MessageCache } from '@service/redis/message.cache';
import { UserCache } from '@service/redis/user.cache';
import { socketIOChatObject } from '@socket/chat';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const userCache: UserCache = new UserCache();
const messageCache: MessageCache = new MessageCache();

export class Add {
  @joiValidation(addChatSchema)
  public async message(req: Request, res: Response): Promise<void> {
    const {
      conversationId,
      receiverId,
      receiverUsername,
      receiverAvatarColor,
      receiverProfilePicture,
      body,
      gifUrl,
      isRead,
      selectedImage
    } = req.body;
    let fileUrl = '';
    const messageObjectId: ObjectId = new ObjectId();
    const conversationObjectId: ObjectId = conversationId ? new mongoose.Types.ObjectId(conversationId) : new ObjectId();
    const sender: IUserDocument = await userCache.getUserDataFromCache(req.currentUser!.userId);
    if (selectedImage.length) {
      const result: UploadApiResponse = (await uploads(req.body.image, req.currentUser!.userId, true, true)) as UploadApiResponse;
      if (!result?.public_id) {
        throw new BadRequestError(result.message);
      }
      fileUrl = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${result.public_id}`;
    }
    const messageData: IMessageData = {
      _id: `${messageObjectId}`,
      conversationId: conversationObjectId,
      receiverId,
      receiverAvatarColor,
      receiverProfilePicture,
      receiverUsername,
      senderUsername: req.currentUser!.username,
      senderId: req.currentUser!.userId,
      senderAvatarColor: req.currentUser!.avatarColor,
      senderProfilePicture: sender.profilePicture,
      body,
      isRead,
      gifUrl,
      selectedImage: fileUrl,
      reaction: [],
      createdAt: new Date(),
      deleteForEveryone: false,
      deleteForMe: false
    };
    Add.prototype.emitSocketIOEvent(messageData);
    if (!isRead) {
      Add.prototype.messageNotification({
        currentUser: req.currentUser!,
        message: body,
        receiverName: receiverUsername,
        receiverId,
        messageData
      });
    }
    await messageCache.addChatListToCache(req.currentUser!.userId, receiverId, `${conversationObjectId}`);
    await messageCache.addChatListToCache(receiverId, req.currentUser!.userId, `${conversationObjectId}`);
    await messageCache.addChatMessageToCache(`${conversationObjectId}`, messageData);
    chatQueue.addChatJob('addChatMessageToDB', messageData);
    res.status(HTTP_STATUS.OK).json({ message: 'Message added' });
  }
  private emitSocketIOEvent(data: IMessageData): void {
    socketIOChatObject.emit('message received', data);
    socketIOChatObject.emit('chat list', data);
  }
  private async messageNotification({ currentUser, message, receiverName, receiverId }: IMessageNotification): Promise<void> {
    const cachedUser: IUserDocument = await userCache.getUserDataFromCache(receiverId);
    if (cachedUser.notifications.messages) {
      const templateParams: INotificationTemplate = {
        username: receiverName,
        message,
        header: `Message notification from ${currentUser.username}`
      };
      const template: string = notificationTemplate.notificationMessageTemplate(templateParams);
      mailQueue.addEmailJob('directMessageEmail', {
        receiverEmail: cachedUser.email!,
        template,
        subject: `You've received messages from ${currentUser.username}`
      });
    }
  }
}
