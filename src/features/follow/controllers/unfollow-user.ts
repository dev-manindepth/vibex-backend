import { followQueue } from '@service/queues/follow.queue';
import { FollowCache } from '@service/redis/follow.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const followCache: FollowCache = new FollowCache();
export class Remove {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params;
    const removeFollowerFromCache: Promise<void> = followCache.removeFollowerOrFolloweeFromCache(
      `follower:${followeeId}`,
      req.currentUser!.userId
    );
    const removeFolloweeFromCache: Promise<void> = followCache.removeFollowerOrFolloweeFromCache(
      `following:${req.currentUser!.userId}`,
      followeeId
    );

    const followerCount: Promise<void> = followCache.updateFollowerOrFolloweeCountInCache(followeeId, 'followersCount', -1);
    const followingCount: Promise<void> = followCache.updateFollowerOrFolloweeCountInCache(req.currentUser!.userId, 'followingCount', -1);

    await Promise.all([followerCount, followingCount, removeFollowerFromCache, removeFolloweeFromCache]);

    followQueue.addFollowJob('removeFollowerFromDB', { followeeId, userId: req.currentUser!.userId });

    res.status(HTTP_STATUS.OK).json({ message: 'User unfollowed now' });
  }
}
