import { User } from '@follow/controllers/block-user';
import { Add } from '@follow/controllers/follow-user';
import { Get } from '@follow/controllers/get-follower';
import { Remove } from '@follow/controllers/unfollow-user';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class FollowRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }
  public routes() {
    this.router.get('/user/following', authMiddleware.checkAuthentication, Get.prototype.following);
    this.router.get('/user/followers', authMiddleware.checkAuthentication, Get.prototype.followers);
    this.router.put('/user/follow/:followeeId', authMiddleware.checkAuthentication, Add.prototype.follower);
    this.router.put('/user/unfollow/:followeeId', authMiddleware.checkAuthentication, Remove.prototype.follower);

    this.router.put('/user/block/:userToBlockId', authMiddleware.checkAuthentication, User.prototype.block);
    this.router.put('/user/unblock/:userToUnblockId', authMiddleware.checkAuthentication, User.prototype.unblock);
    return this.router;
  }
}
export const followRoutes: FollowRoutes = new FollowRoutes();
