import { IMessageData } from '@chat/interfaces/chat.interace';
import { IConversationDocument } from '@chat/interfaces/conversation.interface';
import { MessageModel } from '@chat/models/chat.model';
import { ConversationModel } from '@chat/models/conversation.model';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

class ChatService {
  public async getUserConversationList(currentUserId: string): Promise<IMessageData[]> {
    const messages: IMessageData[] = await MessageModel.aggregate([
      {
        $match: {
          $or: [
            {
              senderId: new mongoose.Types.ObjectId(currentUserId)
            },
            {
              receiverId: new mongoose.Types.ObjectId(currentUserId)
            }
          ]
        }
      },
      {
        $group: {
          _id: '$conversationId',
          result: { $last: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: '$result._id',
          conversationId: '$result.conversationId',
          receiverId: '$result.receiverId',
          receiverUsername: '$result.receiverUsername',
          receiverAvatarColor: '$result.receiverAvatarColor',
          receiverProfilePicture: '$result.receiverProfilePicture',
          senderUsername: '$result.senderUsername',
          senderId: '$result.senderId',
          senderAvatarColor: '$result.senderId',
          senderProfilePicture: '$result.senderProfilePicture',
          body: '$result.body',
          isRead: '$result.isRead',
          gifUrl: '$result.gifUrl',
          selectedImage: '$result.selectedImage',
          reaction: '$result.reaction',
          createdAt: '$result.createdAt'
        }
      },
      {
        $sort: { createdAt: 1 }
      }
    ]);
    return messages;
  }
  public async getMessages(senderId: ObjectId, receiverId: ObjectId, sort: Record<string, 1 | -1>): Promise<IMessageData[]> {
    const query = {
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    };

    const messages: IMessageData[] = await MessageModel.aggregate([{ $match: query }, { $sort: sort }]);
    return messages;
  }
  public async addMessageToDB(data: IMessageData): Promise<void> {
    const conversation: IConversationDocument[] = await ConversationModel.find({ _id: data?.conversationId });
    if (conversation.length == 0) {
      await ConversationModel.create({
        _id: data?.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId
      });
    }
    await MessageModel.create(data);
  }
  public async markMessagesAsReadInDB(senderId: ObjectId, receiverId: ObjectId): Promise<void> {
    const query = {
      $or: [
        {
          senderId,
          receiverId,
          isRead: false
        },
        {
          senderId: receiverId,
          receiverId: senderId,
          isRead: false
        }
      ]
    };
    await MessageModel.updateMany(query, { $set: { isRead: true } });
  }
  public async markMessageAsDeletedInDB(messageId: ObjectId, type: string): Promise<void> {
    if (type == 'deleteForMe') {
      await MessageModel.updateOne({ _id: messageId }, { $set: { deleteForMe: true } });
    } else if (type == 'deleteForEveryone') {
      await MessageModel.updateOne({ _id: messageId }, { $set: { deleteForEveryone: true, deleteForMe: true } });
    }
  }
  public async updateMessageReaction(messageId: ObjectId, senderName: string, reaction: string, type: 'add' | 'remove') {
    if (type == 'add') {
      const message: IMessageData = (await MessageModel.findOne({ _id: messageId })) as IMessageData;
      if (message) {
        const messageReaction = message.reaction.filter((msg) => msg.senderName !== senderName);
        message.reaction = [...messageReaction, { senderName, type: reaction }];
        await MessageModel.updateOne({ _id: messageId }, { $set: { reaction: message.reaction } }).exec();
      }
    } else if (type == 'remove') {
      await MessageModel.updateOne({ _id: messageId }, { $pull: { reaction: { senderName } } }).exec();
    }
  }
}
export const chatService: ChatService = new ChatService();
