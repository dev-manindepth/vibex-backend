import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { IPostDocument, IReactions, ISavePostToCache } from '@post/interfaces/post.interface';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import Logger from 'bunyan';

const log: Logger = config.createLogger('postCache');
export type PostCacheMultiType = string | number | Buffer | IPostDocument | IPostDocument[] | RedisCommandRawReply[];
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
  public async updatePostInCache(postId: string, data: IPostDocument): Promise<IPostDocument> {
    if (!this.client.isOpen) {
      this.client.connect();
    }
    // Update the redis cache
    for (const [key, value] of Object.entries(data)) {
      await this.client.HSET(`posts:${postId}`, `${key}`, `${value}`);
    }
    // Return the udpated data
    const multi: ReturnType<typeof this.client.multi> = this.client.multi();
    multi.HGETALL(`posts:${postId}`);
    const response: PostCacheMultiType = await multi.exec();
    const post = response as unknown as IPostDocument[];
    post[0].commentsCount = Helpers.parseJSON(`${post[0].commentsCount}`) as number;
    post[0].reactions = Helpers.parseJSON(`${post[0].reactions}`) as IReactions;
    post[0].createdAt = new Date(Helpers.parseJSON(`${post[0].createdAt}`)) as Date;
    return post[0];
  }
}
