import { CurrentUser } from '@auth/controllers/currentuser';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class CurrentUserRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.get('/currentuser', authMiddleware.checkAuthentication, CurrentUser.prototype.read);
    return this.router;
  }
}

export const currentUserRoute: CurrentUserRoute = new CurrentUserRoute();
