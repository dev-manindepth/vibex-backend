import { authMiddleware } from '@global/helpers/auth-middleware';
import { Add } from '@reaction/controllers/add-reaction';
import { Get } from '@reaction/controllers/get-reaction';
import { Remove } from '@reaction/controllers/remove-reaction';
import express, { Router } from 'express';

class ReactionRoute {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.get('/post/reaction/:postId', authMiddleware.checkAuthentication, Get.prototype.reactions);
    this.router.get('/post/single/reaction/:username/:postId', authMiddleware.checkAuthentication, Get.prototype.singleReactionByUsername);
    this.router.get('/post/reactions/username/:username', authMiddleware.checkAuthentication, Get.prototype.reationsByUsername);

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
