import { authMiddleware } from '@global/helpers/auth-middleware';
import { Add } from '@image/controllers/add-image';
import express, { Router } from 'express';

class ImageRoute {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.post('/image/profile', authMiddleware.checkAuthentication, Add.prototype.profileImage);
    this.router.post('/image/background', authMiddleware.checkAuthentication, Add.prototype.backgroundImage);
    return this.router;
  }
}
export const imageRoute: ImageRoute = new ImageRoute();