import { authMiddleware } from '@global/helpers/auth-middleware';
import { Add } from '@reactions/controllers/add-reaction';
import { Remove } from '@reactions/controllers/remove-reaction';
import express, { Router } from 'express';

class ReactionRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, Add.prototype.reaction);
    this.router.delete(
      '/post/reaction/:postId/:previousReaction/:postReactions',
      authMiddleware.checkAuthentication,
      Remove.prototype.reaction
    );
    return this.router;
  }
}
export const reactionRoute: ReactionRoute = new ReactionRoute();
