import { authMiddleware } from '@global/helpers/auth-middleware';
import { Get } from '@user/controllers/get-profile';
import express, { Router } from 'express';

class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/user/profile', authMiddleware.checkAuthentication, Get.prototype.profile);
    this.router.get('/user/profile/:userId', authMiddleware.checkAuthentication, Get.prototype.profileByUserId);
    this.router.get('/user/profile/posts/:username/:userId/:uId', authMiddleware.checkAuthentication, Get.prototype.profileWithPosts);
    this.router.get('/user/profile/user/suggestions', authMiddleware.checkAuthentication, Get.prototype.randomUserSuggestions);
    this.router.get('/user/all/:page', authMiddleware.checkAuthentication, Get.prototype.all);

    return this.router;
  }
}
export const userRoutes: UserRoutes = new UserRoutes();
