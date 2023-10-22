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
    return this.router;
  }
}
export const imageRoute: ImageRoute = new ImageRoute();
