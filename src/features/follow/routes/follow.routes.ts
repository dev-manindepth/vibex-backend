import { Add } from '@follow/controllers/follow-user';
import { Remove } from '@follow/controllers/unfollow-user';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class FollowRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.put('/user/follow/:followeeId', authMiddleware.checkAuthentication, Add.prototype.follower);
    this.router.put('/user/unfollow/:followeeId', authMiddleware.checkAuthentication, Remove.prototype.follower);
    return this.router;
  }
}
export const followRoutes: FollowRoutes = new FollowRoutes();
