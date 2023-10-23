import { IChatUsers, IMessageData } from '@chat/interfaces/chat.interace';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('messageCache');

export class MessageCache extends BaseCache {
  constructor() {
    super('messageCache');
  }
  public async addChatListToCache(senderId: string, receiverId: string, conversationId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      if (userChatList.length == 0) {
        await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
      } else {
        const receiverIndex: number = userChatList.findIndex((chat) => chat.includes(receiverId));
        if (receiverIndex < 0) {
          await this.client.RPUSH(`chatList:${senderId}`, JSON.stringify({ receiverId, conversationId }));
        }
      }
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error. Try again.');
    }
  }
  public async addChatMessageToCache(conversationId: string, message: IMessageData): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.RPUSH(`messages:${conversationId}`, JSON.stringify(message));
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error.Try again.');
    }
  }
  public async addChatUsersToCache(users: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const chatUsersList: IChatUsers[] = await this.getChatUsersList();
      const userIndex: number = chatUsersList.findIndex((user) => JSON.stringify(user) == JSON.stringify(users));
      let chatUsers: IChatUsers[] = [];
      if (userIndex == -1) {
        await this.client.RPUSH('chatUsers', JSON.stringify(users));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = chatUsersList;
      }
      return chatUsers;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error.Try again.');
    }
  }
  public async getChatUsersList(): Promise<IChatUsers[]> {
    const chatUsersList: IChatUsers[] = [];
    const chatUsers = await this.client.LRANGE('chatUsers', 0, -1);
    for (const user of chatUsers) {
      chatUsersList.push(Helpers.parseJSON(user));
    }
    return chatUsersList;
  }
}
