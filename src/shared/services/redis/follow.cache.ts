import { IFollowData } from '@follow/interfaces/follower.interface';
import { ServerError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';
import { UserCache } from '@service/redis/user.cache';
import mongoose from 'mongoose';

const log: Logger = config.createLogger('followCache');
const userCache: UserCache = new UserCache();

export class FollowCache extends BaseCache {
  constructor() {
    super('followCache');
  }
  // key -> following:currerUser.userId , follower:followerId
  // value -> (following:currerUser.userId -> followerId ,  follower:followerId -> currentUser.userId)
  public async saveFollowerOrFolloweeToCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(key, value);
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error. Please Try again.');
    }
  }
  public async updateFollowerOrFolloweeCountInCache(userId: string, prop: string, value: number): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HINCRBY(`users:${userId}`, prop, value);
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error. Please Try again.');
    }
  }
  public async removeFollowerOrFolloweeFromCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LREM(key, 1, value);
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error. Try again.');
    }
  }

  public async getFollowersFromCache(key: string): Promise<IFollowData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const rawFollowDocument: string[] = await this.client.LRANGE(key, 0, -1);
      const followDocumentCollection: IFollowData[] = [];
      for (const followDocument of rawFollowDocument) {
        const user: IUserDocument = await userCache.getUserDataFromCache(followDocument);
        const data: IFollowData = {
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
        followDocumentCollection.push(data);
      }
      return followDocumentCollection;
    } catch (err) {
      log.error(err);
      throw new ServerError('Server Error. Try again.');
    }
  }
}
