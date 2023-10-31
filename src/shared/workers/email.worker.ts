import { config } from '@root/config';
import { mailService } from '@service/emails/mail.service';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';

const log: Logger = config.createLogger('emailWorker');
class MailWorker {
  public async sendMail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { template, receiverEmail, subject } = job.data;
      await mailService.sendEmail(receiverEmail, subject, template);
      job.progress(100);
      done(null, job.data);
    } catch (err) {
      log.error(err);
      done(err as Error);
    }
  }
}
export const mailWorker: MailWorker = new MailWorker();
