import { BadRequestError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import Logger from 'bunyan';
import nodemailer from 'nodemailer';
import sendGridMail from '@sendgrid/mail';
import Mail from 'nodemailer/lib/mailer';

const log: Logger = config.createLogger('mailTransport');

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}
sendGridMail.setApiKey(config.SENDGRID_API_KEY!);
class MailService {
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    if (config.NODE_ENV == 'test' || config.NODE_ENV == 'development') {
      this.sendDevelopmentEmail(receiverEmail, subject, body);
    } else {
      this.sendProductionEmail(receiverEmail, subject, body);
    }
  }
  private async sendDevelopmentEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    const transporter: Mail = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: config.SENDER_EMAIL,
        pass: config.SENDER_EMAIL_PASSWORD
      }
    });
    const mailOptions: IMailOptions = {
      from: `VibeX App ${config.SENDER_EMAIL}`,
      to: receiverEmail,
      subject,
      html: body
    };
    try {
      await transporter.sendMail(mailOptions);
      log.info('Developement email sent');
    } catch (error) {
      log.error('Error in sending dev email ', error);
      throw new BadRequestError('Error sending dev emails.');
    }
  }
  private async sendProductionEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    const mailOptions: IMailOptions = {
      from: `VibeX App ${config.SENDER_EMAIL}`,
      to: receiverEmail,
      subject,
      html: body
    };
    try {
      await sendGridMail.send(mailOptions);
      log.info('Production email sent');
    } catch (error) {
      log.error('Error in sending prod email ', error);
      throw new BadRequestError('Error sending prod emails.');
    }
  }
}

export const mailService: MailService = new MailService();
