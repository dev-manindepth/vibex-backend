import { IMessageData } from '@chat/interfaces/chat.interace';
import { chatService } from '@service/db/chat.service';
import { MessageCache } from '@service/redis/message.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';

const messageCache: MessageCache = new MessageCache();
export class Get {
  public async conversationList(req: Request, res: Response): Promise<void> {
    const currentUser = req.currentUser!.userId;
    let list: IMessageData[] = [];
    const cachedList: IMessageData[] = await messageCache.getUserConversationList(currentUser);
    if (cachedList.length) {
      list = cachedList;
    } else {
      list = await chatService.getUserConversationList(currentUser);
    }
    res.status(HTTP_STATUS.OK).json({ message: 'User conversation list', list });
  }
  public async messages(req: Request, res: Response): Promise<void> {
    const { receiverId } = req.params;
    let messages: IMessageData[] = [];

    const cachedMessages: IMessageData[] = await messageCache.getChatMessagesFromCache(req.currentUser!.userId, receiverId);
    if (cachedMessages.length) {
      messages = cachedMessages;
    } else {
      messages = await chatService.getMessages(
        new mongoose.Types.ObjectId(req.currentUser!.userId),
        new mongoose.Types.ObjectId(receiverId),
        {
          createdAt: 1
        }
      );
    }
    res.status(HTTP_STATUS.OK).json({ message: 'User chat messages', messages });
  }
}
