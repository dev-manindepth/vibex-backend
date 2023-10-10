import { Add } from '@comment/controllers/add-comments';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class CommentRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.post('/post/comment', authMiddleware.checkAuthentication, Add.prototype.comments);
    return this.router;
  }
}
export const commentRoute: CommentRoute = new CommentRoute();
