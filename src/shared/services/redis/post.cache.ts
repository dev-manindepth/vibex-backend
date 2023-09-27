import { ServerError } from '@global/helpers/error-handler';
import { ISavePostToCache } from '@post/interfaces/post.interface';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('postCache');
export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }
  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { postId, currentUserId, uId, createdPost } = data;

    const dataToSave = { ...createdPost, reactions: JSON.stringify(createdPost.reactions) };
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postsCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      await this.client.ZADD('post', { score: parseInt(uId, 10), value: `${postId}` });
      for (const [key, value] of Object.entries(dataToSave)) {
        multi.HSET(`posts:${postId}`, `${key}`, `${value}`);
      }
      const count: number = parseInt(postCount[0], 10) + 1;
      multi.HSET(`users:${currentUserId}`, 'postsCount', `${count}`);
      multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
