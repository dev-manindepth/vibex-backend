import { authMiddleware } from '@global/helpers/auth-middleware';
import { Add } from '@image/controllers/add-image';
import { Delete } from '@image/controllers/delete-image';
import { Get } from '@image/controllers/get-image';
import express, { Router } from 'express';

class ImageRoute {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.get('/images', authMiddleware.checkAuthentication, Get.prototype.image);
    this.router.post('/image/profile', authMiddleware.checkAuthentication, Add.prototype.profileImage);
    this.router.post('/image/background', authMiddleware.checkAuthentication, Add.prototype.backgroundImage);
    this.router.delete('/image/:imageId', authMiddleware.checkAuthentication, Delete.prototype.image);
    this.router.delete('/image/background/:bgImageId', authMiddleware.checkAuthentication, Delete.prototype.backgroundImage);
    return this.router;
  }
}
export const imageRoute: ImageRoute = new ImageRoute();
