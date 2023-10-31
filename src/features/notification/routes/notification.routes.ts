import { authMiddleware } from '@global/helpers/auth-middleware';
import { Delete } from '@notification/controller/delete-notification';
import { Get } from '@notification/controller/get-notification';
import { Update } from '@notification/controller/update-notification';
import express, { Router } from 'express';

class NotificationRoute {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.get('/notification', authMiddleware.checkAuthentication, Get.prototype.notification);
    this.router.put('/notification/:notificationId', authMiddleware.checkAuthentication, Update.prototype.notification);
    this.router.delete('/notification/:notificationId', authMiddleware.checkAuthentication, Delete.prototype.notification);
    return this.router;
  }
}

export const notificationRoute: NotificationRoute = new NotificationRoute();
