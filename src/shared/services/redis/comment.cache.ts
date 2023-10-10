import { BaseCache } from './base.cache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';

const log: Logger = config.createLogger('commentCache');
export class CommentCache extends BaseCache {
  constructor() {
    super('commentCache');
  }
  public async savePostCommentToCache(postId: string, commentData: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(`comments:${postId}`, commentData);
      const commentsCount: string[] = await this.client.HMGET(`posts:${postId}`, 'commentsCount');
      let count: number = Helpers.parseJSON(commentsCount[0]);
      count++;
      await this.client.HSET(`posts:${postId}`, 'commentsCount', count);
    } catch (err) {
      log.error(err);
      throw new ServerError('Server error. Please Try again.');
    }
  }
}
