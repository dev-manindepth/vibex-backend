import { IChatList, IChatUsers, IGetMessageFromCache, IMessageData } from '@chat/interfaces/chat.interace';
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
  public async getUserConversationList(currentUserId: string): Promise<IMessageData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList: string[] = await this.client.LRANGE(`chatList:${currentUserId}`, 0, -1);
      const conversationChatList: IMessageData[] = [];
      for (const userChat of userChatList) {
        const chatItem: IChatList = Helpers.parseJSON(userChat) as IChatList;
        const lastMessage: string = (await this.client.LINDEX(`messages:${chatItem.conversationId}`, -1)) as string;
        conversationChatList.push(Helpers.parseJSON(lastMessage));
      }
      return conversationChatList;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error.Try again.');
    }
  }
  public async getChatMessagesFromCache(senderId: string, receiverId: string): Promise<IMessageData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const userChatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      const receiver: string = userChatList.find((userChat) => userChat.includes(receiverId)) as string;
      const parsedReceiver: IChatList = Helpers.parseJSON(receiver) as IChatList;
      if (parsedReceiver) {
        const userMessages: string[] = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
        const chatMessages: IMessageData[] = [];
        for (const message of userMessages) {
          chatMessages.push(Helpers.parseJSON(message));
        }
        return chatMessages;
      } else {
        return [];
      }
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error.Try again.');
    }
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
  public async removeChatUsersFromCache(chatUser: IChatUsers): Promise<IChatUsers[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const chatUsersList: IChatUsers[] = await this.getChatUsersList();
      const userIndex: number = chatUsersList.findIndex((user) => JSON.stringify(user) == JSON.stringify(chatUser));
      let chatUsers: IChatUsers[] = [];
      if (userIndex > -1) {
        await this.client.LREM('chatUsers', userIndex, JSON.stringify(chatUser));
        chatUsers = await this.getChatUsersList();
      } else {
        chatUsers = chatUsersList;
      }
      return chatUsers;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error. Try again.');
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
  public async updateChatMessages(senderId: string, receiverId: string): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      console.log('sender ', senderId, receiverId);
      const userChatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
      const receiver: string = userChatList.find((user) => user.includes(receiverId)) as string;
      const parsedReceiver: IChatList = Helpers.parseJSON(receiver);
      const messages: string[] = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
      const unreadMessages: string[] = messages.filter((message) => !Helpers.parseJSON(message).isRead);
      for (const unreadMessage of unreadMessages) {
        const chatItem = Helpers.parseJSON(unreadMessage) as IMessageData;
        chatItem.isRead = true;
        const index = messages.findIndex((message) => message.includes(`${chatItem._id}`));
        await this.client.LSET(`messages:${chatItem.conversationId}`, index, JSON.stringify(chatItem));
      }
      const lastMessage: string = (await this.client.LINDEX(`messages:${parsedReceiver.conversationId}`, -1)) as string;
      return Helpers.parseJSON(lastMessage) as IMessageData;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error.Try again.');
    }
  }
  public async markMessageAsDeleted(senderId: string, receiverId: string, messageId: string, type: string): Promise<IMessageData> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const { index, message, receiver } = await this.getMesssage(senderId, receiverId, messageId);
      const chatItem = Helpers.parseJSON(message) as IMessageData;
      if (type == 'deleteForMe') {
        chatItem.deleteForMe = true;
      } else if (type == 'deleteForEveryone') {
        chatItem.deleteForEveryone = true;
        chatItem.deleteForMe = true;
      }
      await this.client.LSET(`messages:${receiver.conversationId}`, index, JSON.stringify(chatItem));
      const lastMessage: string = (await this.client.LINDEX(`messages:${receiver.conversationId}`, index)) as string;
      return Helpers.parseJSON(lastMessage) as IMessageData;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error.Try again.');
    }
  }
  private async getMesssage(senderId: string, receiverId: string, messageId: string): Promise<IGetMessageFromCache> {
    const userChatList: string[] = await this.client.LRANGE(`chatList:${senderId}`, 0, -1);
    const receiver: string = userChatList.find((userChat) => userChat.includes(receiverId)) as string;
    const parsedReceiver: IChatList = Helpers.parseJSON(receiver);
    const messages: string[] = await this.client.LRANGE(`messages:${parsedReceiver.conversationId}`, 0, -1);
    const message: string = messages.find((message) => message.includes(messageId)) as string;
    const index: number = messages.findIndex((message) => message.includes(messageId));
    return { index, message, receiver: parsedReceiver };
  }
}
