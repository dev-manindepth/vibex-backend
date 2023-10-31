import fs from 'fs';
import ejs from 'ejs';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';

class NotificationTemplate {
  public notificationMessageTemplate(templateParas: INotificationTemplate): string {
    const { username, header, message } = templateParas;
    return ejs.render(fs.readFileSync(__dirname + '/notification-template.ejs', 'utf-8'), {
      username,
      header,
      message,
      image_url: 'https://www.svgrepo.com/show/304531/notification-alert.svg'
    });
  }
}

export const notificationTemplate: NotificationTemplate = new NotificationTemplate();
