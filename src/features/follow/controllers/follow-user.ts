/* eslint-disable @typescript-eslint/no-unused-vars */
import { IFollowerData } from '@follow/interfaces/follower.interface';
import { followQueue } from '@service/queues/follow.queue';
import { FollowCache } from '@service/redis/follow.cache';
import { UserCache } from '@service/redis/user.cache';
import { socketIOFollowObject } from '@socket/follow';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import HTTP_STATUS from 'http-status-codes';

const userCache: UserCache = new UserCache();
const followCache: FollowCache = new FollowCache();

// follower -> The person who follows other (Update followingCount)
// followee -> The person who is being followed (Update followersCount)
export class Add {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params;

    // Update count in cache
    // Update the following count of currently loggedin user who clicks on follow button
    const followingCount: Promise<void> = followCache.updateFollowerOrFolloweeCountInCache(req.currentUser!.userId, 'followingCount', 1);
    //Update the followerCount of user who is being followed(followee)
    const followersCount: Promise<void> = followCache.updateFollowerOrFolloweeCountInCache(followeeId, 'followersCount', 1);

    await Promise.all([followingCount, followersCount]);
    const cachedFollower = await userCache.getUserDataFromCache(req.currentUser!.userId);
    const cachedFollowee = await userCache.getUserDataFromCache(followeeId);

    const followerObjectId: ObjectId = new ObjectId();
    const followerData: IFollowerData = Add.prototype.userData(cachedFollower);
    socketIOFollowObject.emit('add follower', followerData);

    const addFollowerToCache: Promise<void> = followCache.saveFollowerOrFolloweeToCache(`following:${req.currentUser!.userId}`, followeeId);
    const addFolloweeToCache: Promise<void> = followCache.saveFollowerOrFolloweeToCache(
      `follower:${followeeId}`,
      `${req.currentUser!.userId}`
    );
    await Promise.all([addFollowerToCache, addFolloweeToCache]);
    followQueue.addFollowJob('addFollowerToDB', {
      followeeId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      followerDocumentId: followerObjectId
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user
    };
  }
}
