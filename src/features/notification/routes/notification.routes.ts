import { authMiddleware } from '@global/helpers/auth-middleware';
import { Update } from '@notification/controller/update-notification';
import express, { Router } from 'express';

class NotificationRoute {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.put('/notification/:notificationId', authMiddleware.checkAuthentication, Update.prototype.notification);
    return this.router;
  }
}

export const notificationRoute: NotificationRoute = new NotificationRoute();
