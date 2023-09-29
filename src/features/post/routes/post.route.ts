import { authMiddleware } from '@global/helpers/auth-middleware';
import { Create } from '@post/controllers/create-post';
import { Update } from '@post/controllers/update-post';
import express, { Router } from 'express';

class PostRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/post', authMiddleware.checkAuthentication, Create.prototype.post);
    this.router.post('/post/image/post', authMiddleware.checkAuthentication, Create.prototype.postWithImage);
    this.router.post('/post/video/post', authMiddleware.checkAuthentication, Create.prototype.postWithVideo);

    this.router.put('/post/:postId', authMiddleware.checkAuthentication, Update.prototype.post);
    this.router.put('/post/image/post/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithImage);
    this.router.put('/post/video/post/:postId', authMiddleware.checkAuthentication, Update.prototype.postWithVideo);
    return this.router;
  }
}

export const postRoutes: PostRoute = new PostRoute();
