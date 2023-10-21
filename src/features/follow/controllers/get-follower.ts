import { IFollowData } from '@follow/interfaces/follower.interface';
import { followService } from '@service/db/follow.service';
import { FollowCache } from '@service/redis/follow.cache';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import HTTP_STATUS from 'http-status-codes';

const followCache: FollowCache = new FollowCache();
export class Get {
  // Return all the users whom loggedin user is following
  public async following(req: Request, res: Response): Promise<void> {
    const userId: ObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
    const cachedUserFollowing: IFollowData[] = await followCache.getFollowersFromCache(`following:${userId}`);
    const following: IFollowData[] = cachedUserFollowing.length ? cachedUserFollowing : await followService.getFolloweeFromDB(userId);

    res.status(HTTP_STATUS.OK).json({ message: 'User following', following });
  }
  // Return all the users who  loggedin user is following
  public async followers(req: Request, res: Response): Promise<void> {
    const userId: ObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
    const cachedFollowers: IFollowData[] = await followCache.getFollowersFromCache(`follower:${userId}`);
    const followers: IFollowData[] = cachedFollowers.length ? cachedFollowers : await followService.getFollowersFromDB(userId);

    res.status(HTTP_STATUS.OK).json({ message: 'User Followers', followers });
  }
}
