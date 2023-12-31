import { mailWorker } from '@root/shared/workers/email.worker';
import { BaseQueue } from '@service/queues/base.queue';
import { IEmailJob } from '@user/interfaces/user.interface';

class MailQueue extends BaseQueue {
  constructor() {
    super('emails');
    this.processJob('forgotPasswordEmail', 5, mailWorker.sendMail);
    this.processJob('resetPasswordEmail', 5, mailWorker.sendMail);
    this.processJob('commentsEmail', 5, mailWorker.sendMail);
    this.processJob('followersEmail', 5, mailWorker.sendMail);
    this.processJob('reactionsEmail', 5, mailWorker.sendMail);
    this.processJob('directMessageEmail', 5, mailWorker.sendMail);
    this.processJob('changePassword', 5, mailWorker.sendMail);
  }
  public async addEmailJob(name: string, data: IEmailJob) {
    this.addJob(name, data);
  }
}

export const mailQueue: MailQueue = new MailQueue();
