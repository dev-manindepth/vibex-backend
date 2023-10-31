import { Add } from '@comment/controllers/add-comments';
import { Get } from '@comment/controllers/get-comments';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class CommentRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.get('/post/comment/:postId', authMiddleware.checkAuthentication, Get.prototype.comments);
    this.router.get('/post/commentnames/:postId', authMiddleware.checkAuthentication, Get.prototype.commentsNamesFromCache);
    this.router.get('/post/single/comment/:postId/:commentId', authMiddleware.checkAuthentication, Get.prototype.singleComment);
    this.router.post('/post/comment', authMiddleware.checkAuthentication, Add.prototype.comments);
    return this.router;
  }
}
export const commentRoute: CommentRoute = new CommentRoute();
