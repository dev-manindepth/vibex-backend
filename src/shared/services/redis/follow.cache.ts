import { ServerError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('followCache');

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
}
