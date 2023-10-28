import { IChatJobData, IMessageData } from '@root/features/chat/interfaces/chat.interace';
import { chatWorker } from '@root/shared/workers/chat.worker';
import { BaseQueue } from '@service/queues/base.queue';

class ChatQueue extends BaseQueue {
  constructor() {
    super('chatQueue');
    this.processJob('addChatMessageToDB', 5, chatWorker.addChatMessageToDB);
    this.processJob('markMessagesAsReadInDB', 5, chatWorker.markMessagesAsReadInDB);
    this.processJob('markMessageAsDeletedInDB', 5, chatWorker.markMessageAsDeletedInDB);
  }
  public addChatJob(name: string, data: IChatJobData | IMessageData) {
    this.addJob(name, data);
  }
}

export const chatQueue: ChatQueue = new ChatQueue();
