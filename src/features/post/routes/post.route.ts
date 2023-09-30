import { authMiddleware } from '@global/helpers/auth-middleware';
import { Create } from '@post/controllers/create-post';
import { Delete } from '@post/controllers/delete-post';
import { Get } from '@post/controllers/get-posts';
import { Update } from '@post/controllers/update-post';
import express, { Router } from 'express';

class PostRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/post/all/:page', authMiddleware.checkAuthentication, Get.prototype.post);
    this.router.get('/post/images/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithImage);
    this.router.get('/post/videos/:page', authMiddleware.checkAuthentication, Get.prototype.postsWithVideo);

    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);
    this.router.post('/post/image/post', authMiddleware.checkAuthentication, Create.prototype.postWithImage);
    this.router.post('/post/video/post', authMiddleware.checkAuthentication, Create.prototype.postWithVideo);

    this.router.put('/post/:postId', authMiddleware.checkAuthentication, Update.prototype.post);
    this.router.put('/post/image/post/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithImage);
    this.router.put('/post/video/post/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithVideo);

    this.router.delete('/post/:postId', authMiddleware.checkAuthentication, Delete.prototype.post);
    return this.router;
  }
}

export const postRoutes: PostRoute = new PostRoute();
