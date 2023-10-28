import { config } from '@root/config';
import { chatService } from '@service/db/chat.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('chatWorker');
class ChatWorker {
  public async addChatMessageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      await chatService.addMessageToDB(job.data);
      done(null, job.data);
      job.progress(100);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
  public async markMessagesAsReadInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { senderId, receiverId } = job.data;
      await chatService.markMessagesAsReadInDB(senderId, receiverId);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
  public async markMessageAsDeletedInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { messageId, type } = job.data;
      await chatService.markMessageAsDeletedInDB(messageId, type);
      done(null, job.data);
      job.progress(100);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}

export const chatWorker: ChatWorker = new ChatWorker();
